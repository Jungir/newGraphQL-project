import { GraphQLServer } from 'graphql-yoga';
import db from './db';
import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';
import User from './resolvers/User';
import Comment from './resolvers/Comment';
import Post from './resolvers/Post';

// Scalar types - String, Boolean, Int, Float, ID
// Demo user data
//moved to db.js

// Type definitions (schema)
// moved to schema.gql

// Resolvers

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers: {
    Query,
    Mutation,
    Post,  
    Comment,
    User  
  },
  context: {db}
});
server.start(() => console.log('The server is up!'));
