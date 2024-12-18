import { SearchResult as SearchResultType } from "@/lib/elastic";

export default function SearchResult({ result }: { result: SearchResultType }) {
  return (
    <a
      // TODO: Generate temporary link
      // href={result.path}
      className="flex hover:bg-accent hover:text-accent-foreground p-4 rounded-lg"
    >
      <div className="flex items-start gap-4">
        <img
          src="/file-icons/TXT.svg"
          alt={`${result.filename.split(".").pop()} file icon`}
          className="h-8 w-8 mt-1"
        />
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <p className="font-semibold">{result.filename}</p>
            <p className="text-sm text-muted-foreground">
              Modified: {new Date(result.modified).toLocaleDateString()}
            </p>
          </div>

          <p
            className="text-sm"
            dangerouslySetInnerHTML={{
              __html: result.highlight?.content.join("... ") || result.content,
            }}
          />
        </div>
      </div>
    </a>
  );
}
