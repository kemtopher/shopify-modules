export const PRODUCT_CORE_FRAGMENT = `
  fragment ProductCore on Product {
    id
    title
    handle
    status
    vendor
    productType
    tags
    updatedAt
  }
`;

export const PRODUCT_WITH_VARIANTS_FRAGMENT = `
  fragment ProductWithVariants on Product {
    ...ProductCore
    variants(first: 25) {
      edges {
        node {
          id
          title
          sku
          price
          compareAtPrice
          inventoryQuantity
        }
      }
    }
  }
  ${PRODUCT_CORE_FRAGMENT}
`;

export const PRODUCT_WITH_METAFIELDS_QUERY = `
  query ProductWithMetafields($id: ID!) {
    product(id: $id) {
      ...ProductCore
      metafields(first: 20) {
        edges {
          node {
            id
            namespace
            key
            type
            value
          }
        }
      }
    }
  }
  ${PRODUCT_CORE_FRAGMENT}
`;
