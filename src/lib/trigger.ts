"use server";

import { crawlDropboxTask } from "@/trigger/dropbox";

export async function triggerCrawlDropboxTask({
  dropboxToken,
}: {
  dropboxToken: string;
}) {
  await crawlDropboxTask.trigger({ token: dropboxToken });
}
