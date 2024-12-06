import { createClient } from "redis";

const redis = createClient({
  url: `redis://${process.env.REDIS_HOST || "localhost"}:${
    process.env.REDIS_PORT || "6379"
  }`,
});

redis.connect();

export async function getDropboxScannedFilesCount(): Promise<number> {
  try {
    const count = await redis.sCard("dropboxScannedFiles");
    return count;
  } catch (error) {
    console.error("Error getting dropbox scanned files count:", error);
    throw error;
  }
}
