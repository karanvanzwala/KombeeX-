import { gql } from "@apollo/client";

export const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        token
        lines {
          id
          quantity
          variant {
            id
            name
            product {
              id
              name
              slug
              thumbnail {
                url
              }
            }
            pricing {
              price {
                gross {
                  amount
                  currency
                }
              }
            }
          }
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

// Alternative mutation for adding to existing checkout
export const ADD_TO_EXISTING_CART_MUTATION = gql`
  mutation AddToExistingCart($checkoutId: ID!, $lines: [CheckoutLineInput!]!) {
    checkoutLinesAdd(checkoutId: $checkoutId, lines: $lines) {
      checkout {
        id
        token
        lines {
          id
          quantity
          variant {
            id
            name
            product {
              id
              name
              slug
              thumbnail {
                url
              }
            }
            pricing {
              price {
                gross {
                  amount
                  currency
                }
              }
            }
          }
        }
      }
      errors {
        field
        message
      }
    }
  }
`; 