import { shopifyGraphQLRequest } from './shopify-graphql-request';

const BULK_PRODUCTS_QUERY = `
mutation RunBulkProductsExport {
  bulkOperationRunQuery(
    query: """
    {
      products {
        edges {
          node {
            id
            title
            handle
            updatedAt
          }
        }
      }
    }
    """
  ) {
    bulkOperation {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}
`;

export async function runBulkProductsExport(shop: string, accessToken: string) {
  const result = await shopifyGraphQLRequest<{
    bulkOperationRunQuery: {
      bulkOperation: { id: string; status: string } | null;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>({
    shop,
    accessToken,
    query: BULK_PRODUCTS_QUERY,
  });

  const payload = result.data.bulkOperationRunQuery;

  if (payload.userErrors.length) {
    throw new Error(payload.userErrors.map((e) => e.message).join('; '));
  }

  return payload.bulkOperation;
}
