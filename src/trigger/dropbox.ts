import { logger, task } from "@trigger.dev/sdk/v3";
import axios from "axios";

interface DropboxFile {
  name: string;
  path_display: string;
  server_modified: string;
  ".tag": string;
}

interface DropboxListResponse {
  entries: DropboxFile[];
  cursor: string;
  has_more: boolean;
}

class DropboxConnector {
  private token: string;
  private apiUrl = "https://api.dropboxapi.com/2";
  private contentUrl = "https://content.dropboxapi.com/2";

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders(isContent = false) {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": isContent
        ? "application/octet-stream"
        : "application/json",
    };
  }

  async listFiles(path: string = ""): Promise<DropboxFile[]> {
    try {
      const response = await axios.post<DropboxListResponse>(
        `${this.apiUrl}/files/list_folder`,
        { path },
        { headers: this.getHeaders() }
      );
      return response.data.entries;
    } catch (error) {
      logger.error("Error listing Dropbox files", { error });
      throw error;
    }
  }

  async getTemporaryLink(path: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/files/get_temporary_link`,
        { path },
        { headers: this.getHeaders() }
      );
      return response.data.link;
    } catch (error) {
      logger.error("Error getting temporary link", { error });
      throw error;
    }
  }

  async downloadFile(path: string): Promise<Buffer> {
    try {
      const response = await axios.post(
        `${this.contentUrl}/files/download`,
        null,
        {
          headers: {
            ...this.getHeaders(true),
            "Dropbox-API-Arg": JSON.stringify({ path }),
          },
          responseType: "arraybuffer",
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      logger.error("Error downloading file", { error });
      throw error;
    }
  }
}

async function extractTextWithTika(fileBuffer: Buffer): Promise<string> {
  try {
    const response = await axios.put(
      `${process.env.TIKA_URL}/tika`,
      fileBuffer,
      {
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/octet-stream",
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error extracting text with Tika", { error });
    throw error;
  }
}

async function indexToElasticsearch(document: {
  filename: string;
  path: string;
  url: string;
  content: string;
  modified: string;
}) {
  try {
    const response = await axios.post(
      `${process.env.ELASTICSEARCH_URL}/documents/_doc`,
      document,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Error indexing to Elasticsearch", { error });
    throw error;
  }
}

export const crawlDropboxTask = task({
  id: "crawl-dropbox",
  maxDuration: 3600,
  run: async (token: string) => {
    logger.log("Starting Dropbox crawl");

    const dropbox = new DropboxConnector(token);
    const files = await dropbox.listFiles();

    for (const file of files) {
      if (file[".tag"] === "file") {
        try {
          // Download file content
          const fileBuffer = await dropbox.downloadFile(file.path_display);
          const tempLink = await dropbox.getTemporaryLink(file.path_display);

          // Extract text based on file type
          let textContent: string;
          if (file.name.endsWith(".txt")) {
            textContent = fileBuffer.toString("utf8");
          } else if (
            file.name.endsWith(".pdf") ||
            file.name.endsWith(".docx")
          ) {
            textContent = await extractTextWithTika(fileBuffer);
          } else {
            continue; // Skip unsupported file types
          }

          // Index document in Elasticsearch
          await indexToElasticsearch({
            filename: file.name,
            path: file.path_display,
            url: tempLink,
            content: textContent,
            modified: file.server_modified,
          });

          logger.log("Processed and indexed file", {
            filename: file.name,
            path: file.path_display,
            url: tempLink,
            contentLength: textContent.length,
          });
        } catch (error) {
          logger.error("Error processing file", { file: file.name, error });
          continue;
        }
      }
    }

    return {
      message: "Crawl completed",
    };
  },
});
