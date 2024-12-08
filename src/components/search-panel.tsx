"use client";

import { searchDocuments } from "@/lib/elastic";
import { Input } from "./ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Skeleton } from "@/components/ui/skeleton";
import SearchResult from "./search-result";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "modified">("relevance");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const debouncedQuery = useDebounce(query, 1000);

  const { data, isLoading } = useQuery({
    queryKey: [
      "search",
      debouncedQuery,
      dateRange?.from,
      dateRange?.to,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      searchDocuments({
        query: debouncedQuery,
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
        sortBy,
        sortOrder,
      }),
    enabled: debouncedQuery.length > 2,
    staleTime: 1000,
  });

  return (
    <div className="space-y-6 lg:col-span-2 lg:col-start-1">
      <div className="bg-background shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4">
            <Input
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full"
            />

            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Select
                value={sortBy}
                onValueChange={(value: "relevance" | "modified") =>
                  setSortBy(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="modified">Modified Date</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center mt-4 w-full">
              <div className="flex hover:bg-accent hover:text-accent-foreground p-4 rounded-lg w-full">
                <div className="flex items-center gap-4 w-full">
                  <Skeleton className="h-12 w-12" />
                  <div className="flex flex-col">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64 mt-2" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {data && (
            <div className="mt-4 space-y-4">
              <div className="text-sm text-gray-500">
                {data.length} results for &ldquo;{debouncedQuery}&rdquo;
              </div>
              <div className="overflow-y-auto max-h-[500px]">
                {data.map((result, index) => (
                  <SearchResult key={index} result={result} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
