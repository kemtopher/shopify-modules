type GraphQLSuccess<T> = {
  data: T;
  extensions?: {
    cost?: {
      requestedQueryCost?: number;
      actualQueryCost?: number;
      throttleStatus?: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
};

type GraphQLErrorResponse = {
  errors?: Array<{ message: string }>;
  data?: unknown;
  extensions?: unknown;
};

export async function shopifyGraphQLRequest<T>({
  shop,
  accessToken,
  query,
  variables,
  apiVersion = '2026-04',
}: {
  shop: string;
  accessToken: string;
  query: string;
  variables?: Record<string, unknown>;
  apiVersion?: string;
}): Promise<GraphQLSuccess<T>> {
  const response = await fetch(
    `https://${shop}/admin/api/${apiVersion}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const json = (await response.json()) as GraphQLSuccess<T> & GraphQLErrorResponse;

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(json)}`);
  }

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }

  return json;
}
