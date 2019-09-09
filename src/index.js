import { GraphQLServer } from 'graphql-yoga';


// 5 main types:
//String, Boolean, Int(whole numbers), Float(decimals), ID 
//type definitions (schema)
// cannot have null with !
const typeDefs = `
    type Query{
        me: User!
        post: Post!
    }
    type User{
        id: ID!
        name: String!
        email: String!
        age: Int
    }
    type Post{
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        
    }
`
//resolvers function, what to do when the query is asked
const resolvers = {
    Query: {
        me(){
            return {
                id: '1234', 
                name: 'Kamil', 
                email: 'kamail@netninja.co.uk',     
             
            }
        },
        post(){
            return {
                id: `${Math.random()}`,
                title: 'the best graphQl ever',
                body: 'year u should check this out. Lorem ipsum...',
                published: false

            }
        }
    }
}

//start the server
const server = new GraphQLServer({
    typeDefs, resolvers
});
server.start(() => console.log('server is on port 4000'));
