import { GraphQLServer } from 'graphql-yoga';

//Demo user data
const users = [  
    {id: '2', name: 'Kunau', email: 'kunau@thenetninja.co.uk', age: 23},
    {id: '3', name: 'Jessy', email: 'jessy@thenetninja.co.uk', age: 30},
    {id: '4', name: 'Clair', email: 'clair@thenetninja.co.uk'},
    {id: '1', name: 'Kamil', email: 'kamil@thenetninja.co.uk', age: 23},
]

const posts = [
    {id: '1', title: 'why cheese rules', body: 'the best post ever', published: false, author: '1'},
    {id: '2', title: 'my boobs are large enough', body: 'can not stop reading', published: true, author: '2'},
    {id: '3', title: 'look aside', body: 'where is the exit', published: true, author: '3'},
    {id: '4', title: 'get out of my pc', body: 'stop being unoriginal', published: false, author: '1'}
]
// 5 main types:
//String, Boolean, Int(whole numbers), Float(decimals), ID 
//type definitions (schema)
// cannot have null with !
const typeDefs = `
    type Query{
        me: User!
        post: Post!
        users(query: String): [User!]!
        posts(query: String): [Post!]!
    }
    type User{
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
    }
    type Post{
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
    }
`
//resolvers function, what to do when the query is asked
const resolvers = {
    Query: {
       users(parent, args, ctx, info){
            if(args.query){
                return users.filter(curvalue => {
                    return curvalue.name.toLowerCase().includes(args.query.toLowerCase());
                });; 
            }
            return users;
       },
       posts(parent, args, ctx, info){
            if(!args.query){
                //graphQl expexts array of objects, each object is a parent with each new iteration
                //if it can't resolve some of the fileds and then it goes into the other resolvers to see the match
                return posts;
            }
            return posts.filter(value => {
                return value.title.toLowerCase().includes(args.query.toLowerCase()) || 
                       value.body.toLowerCase().includes(args.query.toLowerCase()); 
            });
       },
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
    },
    //for relational data query
    //if it's not a scalar type we should teach grqph ql were to look for the resolver
    Post:{
        author(parent, args, ctx, info){
            //find() return first instance
            return users.find(user => {
                //parent is the current object inside of a posts array that is dummy data
                //parent is different each time; refers to the object in the array
                return user.id === parent.author;
            });
        }
    },
    //for realtional data query
    User:{
        posts(parent, args, ctx, info){
            return posts.filter(post => {
                return parent.id === post.author;
            });
        }
    }
}

//start the server
const server = new GraphQLServer({
    typeDefs, resolvers
});
server.start(() => console.log('server is on port 4000'));
