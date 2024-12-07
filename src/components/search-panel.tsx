"use client";

import { searchDocuments } from "@/lib/elastic";
import { Input } from "./ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Skeleton } from "@/components/ui/skeleton";
import SearchResult from "./search-result";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 1000);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchDocuments({ query: debouncedQuery }),
    enabled: debouncedQuery.length > 2,
    staleTime: 1000,
  });

  return (
    <div className="space-y-6 lg:col-span-2 lg:col-start-1">
      <section>
        <div className="bg-background shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <Input
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full"
            />
            {isLoading && (
              <div className="flex items-center justify-center">
                <Skeleton className="w-full h-10" />
              </div>
            )}

            {data && (
              <div className="mt-4 space-y-4">
                <div className="text-sm text-gray-500">
                  {data.length} results for "{debouncedQuery}"
                </div>
                {data.map((result, index) => (
                  <SearchResult key={index} result={result} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
