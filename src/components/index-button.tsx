"use client";

import { triggerCrawlDropboxTask } from "@/lib/trigger";
import { Button } from "./ui/button";

export function IndexButton({ dropboxToken }: { dropboxToken: string }) {
  return (
    <Button
      onClick={() =>
        triggerCrawlDropboxTask({
          dropboxToken,
        })
      }
    >
      Start Indexing
    </Button>
  );
}
