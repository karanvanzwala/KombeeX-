// graphql/LOGIN_MUTATION.ts
import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation TokenCreate($email: String!, $password: String!) {
    tokenCreate(email: $email, password: $password) {
      token
      user {
        email
        isStaff
        userPermissions {
          code
        }
      }
      errors {
        field
        message
      }
    }
  }
`; 