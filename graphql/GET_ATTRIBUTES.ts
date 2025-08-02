// graphql/GET_ATTRIBUTES.ts
import { gql } from "@apollo/client";

export const GET_ATTRIBUTES = gql`
  query {
    attributes(first: 10) {
      edges {
        node {
          id
          name
          slug
          inputType
          choices(first: 10) {
            edges {
              node {
                id
                name
                slug
              }
            }
          }
        }
      }
    }
  }
`; 