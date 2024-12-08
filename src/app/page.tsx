export const dynamic = "force-dynamic";

import { IndexPanel } from "@/components/index-panel";
import Navbar from "@/components/navbar";
import { SearchPanel } from "@/components/search-panel";
import { getDropboxAllFiles, getDropboxTotalFilesCount } from "@/lib/redis";
import { getDropboxScannedFilesCount } from "@/lib/redis";
import { getDropboxRuns } from "@/lib/trigger";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TextSearch } from "lucide-react";

export default async function Home() {
  const dropboxToken = process.env.DROPBOX_TOKEN as string;
  const dropboxTotalFilesCount = await getDropboxTotalFilesCount();
  const dropboxScannedFilesCount = await getDropboxScannedFilesCount();
  const dropboxAllFiles = await getDropboxAllFiles();

  const dropboxRuns = await getDropboxRuns(3);

  return (
    <div className="h-screen bg-gray-100">
      <Navbar />
      <div className="">
        <div className="mx-auto max-w-3xl lg:max-w-7xl py-4 sm:px-6">
          <Alert>
            <TextSearch className="h-4 w-4" />
            <AlertTitle>Search Tip!</AlertTitle>
            <AlertDescription>
              Try searching for Indian cities like Bangalore, Mumbai, or cities
              like Paris, Amsterdam to explore documents about different
              countries.
            </AlertDescription>
          </Alert>
          <div className="w-full mt-4 grid  grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
            <SearchPanel />
            <IndexPanel
              dropboxToken={dropboxToken}
              dropboxTotalFilesCount={dropboxTotalFilesCount}
              dropboxScannedFilesCount={dropboxScannedFilesCount}
              dropboxAllFiles={dropboxAllFiles}
              dropboxRuns={dropboxRuns.data}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
