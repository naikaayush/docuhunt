import { createClient } from "redis";

let redis: ReturnType<typeof createClient> | null = null;

export function getRedisClient() {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL,
    });
    redis.connect();
  }
  return redis;
}

export async function getDropboxTotalFilesCount(): Promise<number> {
  try {
    const client = getRedisClient();
    const count = await client.sCard("dropbox:files:total");
    return count;
  } catch (error) {
    console.error("Error getting dropbox total files count:", error);
    throw error;
  }
}

export async function getDropboxScannedFilesCount(): Promise<number> {
  try {
    const client = getRedisClient();
    const count = await client.sCard("dropbox:files:scanned");
    return count;
  } catch (error) {
    console.error("Error getting dropbox scanned files count:", error);
    throw error;
  }
}

export async function getDropboxAllFiles(): Promise<string[]> {
  try {
    const client = getRedisClient();
    const files = await client.sMembers("dropbox:files:total");
    return files;
  } catch (error) {
    console.error("Error getting all dropbox files:", error);
    throw error;
  }
}
