type ThrottleStatus = {
  maximumAvailable: number;
  currentlyAvailable: number;
  restoreRate: number;
};

type ShopifyGraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
  extensions?: {
    cost?: {
      requestedQueryCost?: number;
      actualQueryCost?: number;
      throttleStatus?: ThrottleStatus;
    };
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getWaitMs(throttleStatus?: ThrottleStatus, requestedCost = 50) {
  if (!throttleStatus) return 1500;

  const deficit = requestedCost - throttleStatus.currentlyAvailable;
  if (deficit <= 0) return 0;

  const seconds = deficit / Math.max(throttleStatus.restoreRate, 1);
  return Math.ceil(seconds * 1000) + 250;
}

export async function shopifyGraphQLRateAware<T>({
  shop,
  accessToken,
  query,
  variables,
  apiVersion = '2026-04',
  maxRetries = 4,
}: {
  shop: string;
  accessToken: string;
  query: string;
  variables?: Record<string, unknown>;
  apiVersion?: string;
  maxRetries?: number;
}): Promise<ShopifyGraphQLResponse<T>> {
  let attempt = 0;

  while (true) {
    const response = await fetch(`https://${shop}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = (await response.json()) as ShopifyGraphQLResponse<T>;
    const cost = json.extensions?.cost;
    const throttleStatus = cost?.throttleStatus;
    const requestedCost = cost?.requestedQueryCost ?? 50;

    const throttled =
      json.errors?.some(
        (err) =>
          err.extensions?.code === 'THROTTLED' ||
          /throttled/i.test(err.message)
      ) ?? false;

    if (response.ok && !throttled && !json.errors?.length) {
      return json;
    }

    if (attempt >= maxRetries) {
      throw new Error(JSON.stringify(json));
    }

    const waitMs = getWaitMs(throttleStatus, requestedCost);
    await sleep(waitMs || 1000 * (attempt + 1));
    attempt += 1;
  }
}
