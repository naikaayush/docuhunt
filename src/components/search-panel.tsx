"use client";

import { searchDocuments } from "@/lib/elastic";
import { Input } from "./ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 1000);

  const searchQuery = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchDocuments({ query: debouncedQuery }),
    enabled: debouncedQuery.length > 2,
    staleTime: 1000,
  });
  console.log(searchQuery.data);

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
          </div>
        </div>
      </section>
    </div>
  );
}
