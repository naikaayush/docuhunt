"use client";

import { triggerCrawlDropboxTask } from "@/lib/trigger";
import { Button } from "./ui/button";
import { ProgressCircle } from "./tremor/ProgressCircle";
import { TriggerStatus } from "./trigger-status";
import { RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IndexPanelProps {
  dropboxToken: string;
  dropboxTotalFilesCount: number;
  dropboxScannedFilesCount: number;
  dropboxAllFiles: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dropboxRuns: any[];
}

export function IndexPanel({
  dropboxToken,
  dropboxTotalFilesCount,
  dropboxScannedFilesCount,
  dropboxRuns,
  dropboxAllFiles,
}: IndexPanelProps) {
  return (
    <div className="lg:col-span-1 lg:col-start-3">
      <div className="bg-background px-4 py-5 shadow sm:rounded-lg sm:px-6">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Indexing Progress
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    toast.success("Indexing started");
                    await triggerCrawlDropboxTask({
                      dropboxToken,
                    });
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start Indexing</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

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
        <div className="mt-6 flex flex-col gap-4">
          {dropboxRuns.map((run) => (
            <TriggerStatus key={run.id} taskId={run.id} />
          ))}
        </div>
      </div>
      <div className="bg-background px-4 py-5 shadow sm:rounded-lg sm:px-6 mt-4">
        <div className="flex flex-col gap-4">
          <Table>
            <TableCaption>All files in your Dropbox</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dropboxAllFiles.map((file) => (
                <TableRow key={file}>
                  <TableCell className="font-medium">{file}</TableCell>
                  <TableCell>
                    {dropboxScannedFilesCount > 0 ? "Scanned" : "Pending"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
