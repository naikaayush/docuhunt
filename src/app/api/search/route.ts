export const dynamic = "force-dynamic";

import { Client } from "@elastic/elasticsearch";

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const sortBy =
    (searchParams.get("sortBy") as "modified" | "relevance") || "relevance";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  type QueryClause = {
    multi_match?: {
      query: string;
      fields: string[];
    };
    range?: {
      modified: {
        gte?: string | null;
        lte?: string | null;
      };
    };
  };

  const must: QueryClause[] = [];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ["content"],
      },
    });
  }

  if (startDate || endDate) {
    must.push({
      range: {
        modified: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
    });
  }

  const sort =
    sortBy === "modified"
      ? [{ modified: { order: sortOrder } }]
      : [{ _score: { order: sortOrder } }];

  const response = await client.search({
    index: "documents",
    query: {
      bool: {
        must,
      },
    },
    sort,
    highlight: {
      fields: {
        content: {},
      },
      pre_tags: ["<mark>"],
      post_tags: ["</mark>"],
    },
  });

  return Response.json(
    response.hits.hits.map((hit) => ({
      ...(hit._source as object),
      index: hit._index,
      highlight: hit.highlight,
    }))
  );
}
