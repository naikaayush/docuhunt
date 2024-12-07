"use server";

import { crawlDropboxTask } from "@/trigger/dropbox";
import { runs } from "@trigger.dev/sdk/v3";
import { revalidatePath } from "next/cache";

export async function triggerCrawlDropboxTask({
  dropboxToken,
}: {
  dropboxToken: string;
}) {
  const response = await crawlDropboxTask.trigger({ token: dropboxToken });
  revalidatePath("/");
  return response;
}

export async function getDropboxRuns(limit = 10) {
  return await runs.list({
    taskIdentifier: "crawl-dropbox",
    limit,
  });
}
