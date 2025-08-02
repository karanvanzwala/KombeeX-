// graphql/GET_PRODUCTS.ts
import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
query {
  products(
    first: 100,
    channel: "online-inr"
  ) {
    edges {
      node {
        id
        name
        variants {
          id
          name
          sku
        }
        media{
            url
        }
      }
    }
  }
}
`;
