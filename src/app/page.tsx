import { IndexPanel } from "@/components/index-panel";
import Navbar from "@/components/navbar";
import { SearchPanel } from "@/components/search-panel";

export default async function Home() {
  const dropboxToken = process.env.DROPBOX_TOKEN as string;
  // const dropboxScannedFilesCount = await getDropboxScannedFilesCount();
  // console.log({ dropboxFileCount, dropboxScannedFilesCount });

  return (
    <div className="h-screen bg-gray-100">
      <Navbar />
      <div className=" ">
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
          <SearchPanel />
          <IndexPanel dropboxToken={dropboxToken} />
        </div>
      </div>
    </div>
  );
}
