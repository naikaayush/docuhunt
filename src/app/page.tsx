import { IndexPanel } from "@/components/index-panel";
import Navbar from "@/components/navbar";
import { SearchPanel } from "@/components/search-panel";
import { getDropboxTotalFilesCount } from "@/lib/redis";
import { getDropboxScannedFilesCount } from "@/lib/redis";

export default async function Home() {
  const dropboxToken = process.env.DROPBOX_TOKEN as string;
  const dropboxTotalFilesCount = await getDropboxTotalFilesCount();
  const dropboxScannedFilesCount = await getDropboxScannedFilesCount();

  return (
    <div className="h-screen bg-gray-100">
      <Navbar />
      <div className=" ">
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
          <SearchPanel />
          <IndexPanel
            dropboxToken={dropboxToken}
            dropboxTotalFilesCount={dropboxTotalFilesCount}
            dropboxScannedFilesCount={dropboxScannedFilesCount}
          />
        </div>
      </div>
    </div>
  );
}
