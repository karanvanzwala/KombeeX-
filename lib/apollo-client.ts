// lib/apollo-client.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://saleor.kombee.co.in/graphql/',
  cache: new InMemoryCache(),
});

export default client;
