import { GraphQLServer } from 'graphql-yoga';


// 5 main types:
//String, Boolean, Int(whole numbers), Float(decimals), ID 
//type definitions (schema)
// cannot have null with !
const typeDefs = `
    type Query {
       title: String!
       price: Float!
       releaseYear: Int
       rating: Float
       inStock: Boolean!
    }
`
//resolvers function, what to do when the query is asked
const resolvers = {
    Query: {
      title(){
          return 'Harry Potter';
      },
      price(){
          return 3.4;
      },
      releaseYear(){
          return 2006;
      },
      rating(){
          return 4.9; 
      },
      inStock(){
          return true;
      }
    }
}

//start the server
const server = new GraphQLServer({
    typeDefs, resolvers
});
server.start(() => console.log('server is on port 4000'));
