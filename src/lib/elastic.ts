interface SearchParams {
  query: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "modified" | "relevance";
  sortOrder?: "asc" | "desc";
}

interface SearchResult {
  filename: string;
  path: string;
  content: string;
  modified: string;
}

export async function searchDocuments(
  params: SearchParams
): Promise<SearchResult[]> {
  const searchParams = new URLSearchParams({
    query: params.query,
    ...(params.startDate && { startDate: params.startDate }),
    ...(params.endDate && { endDate: params.endDate }),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortOrder && { sortOrder: params.sortOrder }),
  });

  const response = await fetch(`/api/search?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Search request failed");
  }

  const data = await response.json();
  return data as SearchResult[];
}
