"use client";

import { triggerCrawlDropboxTask } from "@/lib/trigger";
import { Button } from "./ui/button";
import { ProgressCircle } from "./tremor/ProgressCircle";

interface IndexPanelProps {
  dropboxToken: string;
  dropboxTotalFilesCount: number;
  dropboxScannedFilesCount: number;
}

export function IndexPanel({
  dropboxToken,
  dropboxTotalFilesCount,
  dropboxScannedFilesCount,
}: IndexPanelProps) {
  return (
    <section className="lg:col-span-1 lg:col-start-3">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">Indexing Progress</h2>
        <Button
          onClick={() =>
            triggerCrawlDropboxTask({
              dropboxToken,
            })
          }
        >
          Start Indexing
        </Button>
        <div className="mt-6 flex items-center gap-4">
          <ProgressCircle
            value={(dropboxScannedFilesCount / dropboxTotalFilesCount) * 100}
          >
            <span className="text-sm font-medium text-gray-900">
              {Math.round(
                (dropboxScannedFilesCount / dropboxTotalFilesCount) * 100 || 0
              )}
              %
            </span>
          </ProgressCircle>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {dropboxScannedFilesCount}/{dropboxTotalFilesCount}
            </p>
            <p className="text-sm text-gray-500">Files scanned</p>
          </div>
        </div>
      </div>
    </section>
  );
}
