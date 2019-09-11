import { GraphQLServer } from 'graphql-yoga';
import uuidv4 from 'uuid/v4'

//Demo user data
const users = [  
    {id: '1', name: 'Kamil', email: 'kamil@thenetninja.co.uk', age: 23, comment: ["4", "2"]},
    {id: '2', name: 'Kunau', email: 'kunau@thenetninja.co.uk', age: 23, comment: ["3"]},
    {id: '3', name: 'Jessy', email: 'jessy@thenetninja.co.uk', age: 30, comment: ["1"]},
    {id: '4', name: 'Clair', email: 'clair@thenetninja.co.uk', age: null, comment: ["5"] }
]

const posts = [
    {id: '1', title: 'why cheese rules', body: 'the best post ever', published: false, author: '1', comment: ["3", "4"]},
    {id: '2', title: 'my boobs are large enough', body: 'can not stop reading', published: true, author: '2', comment: ["1"]},
    {id: '3', title: 'look aside', body: 'where is the exit', published: true, author: '3', comment: ["2"]},
    {id: '4', title: 'get out of my pc', body: 'stop being unoriginal', published: false, author: '1', comment: ['5']}
]

const comments = [
    {id: '1', text: 'Avarage.', author: '3'},
    {id: '3', text: 'hmm. Pass.', author: '2'},
    {id: '2', text: 'hilarius!', author: '1'},
    {id: '4', text: 'here it is so good.', author: '1'},
    {id: '5', text: 'this is Clair\'s post', author: '4'}
]
// 5 main types:
//String, Boolean, Int(whole numbers), Float(decimals), ID 
//type definitions (schema)
// cannot have null with !
//create user(args) return value User object 
const typeDefs = `
    type Mutation{
        createUser(name: String!, email: String!, age: Int): User!
    }
    type Query{
        me: User!
        post: Post!
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments: [Comment!]!
    }
    type Comment{
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
    type User{
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }
    type Post{
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment]!
    }
`
//resolvers function, what to do when the query is asked
const resolvers = {
    Mutation:{
        createUser(parent, args, ctx, info){
            let emailTaken = users.some(user =>  user.email === args.email);
            if(emailTaken) throw new Error('email is already taken');
            let {name, email, age = null} = args;
            let newUser = {
                name, email, age, comment: [], id:`${uuidv4()}` 
            }
            users.push(newUser);
            return users.find(user => user.id === newUser.id);
        }
    },
    Query: {
        //first set up a basic query resolver and then go to the custom resolves
       comments(parent, args, ctx, info){
            return comments;
       },
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
        },
        comments(parent){
            let postComment = [];
            let comment;
            parent.comment.forEach(commentId => {
                comment = comments.filter(comment => {
                    return comment.id === commentId;
                })
                postComment.push(comment[0]);
            });

            return postComment;
        }
    },
    //for realtional data query
    User:{
        posts(parent, args, ctx, info){
            return posts.filter(post => {
                return parent.id === post.author;
            });
        },
        comments(parent, args, ctx, info){
            let userComment = [];
            let comment;
            parent.comment.forEach(commentId => {
                comment = comments.filter(comment => {
                    return comment.id === commentId;
                })
                userComment.push(comment[0]);
            });
            return userComment;
        } 
        
    },
    Comment:{
        author(parent){
            return users.find(user => {
                return user.id === parent.author;
            });
        },
        post(parent){
            let comment = [];
            posts.forEach(post => {
                if(post.comment.includes(parent.id)){
                    comment.push(post);
                }
            });
            return comment[0];
        }
       
    }
}

//start the server
const server = new GraphQLServer({
    typeDefs, resolvers
});
server.start(() => console.log('server is on port 4000'));
