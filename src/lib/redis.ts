import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.connect();

export async function getDropboxTotalFilesCount(): Promise<number> {
  try {
    const count = await redis.sCard("dropbox:files:total");
    console.log({ count });
    return count;
  } catch (error) {
    console.error("Error getting dropbox total files count:", error);
    throw error;
  }
}

export async function getDropboxScannedFilesCount(): Promise<number> {
  try {
    const count = await redis.sCard("dropbox:files:scanned");
    return count;
  } catch (error) {
    console.error("Error getting dropbox scanned files count:", error);
    throw error;
  }
}
