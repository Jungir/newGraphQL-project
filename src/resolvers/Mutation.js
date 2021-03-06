import uuidv4 from 'uuid/v4';
const Mutation = {
    createUser(parent, args, {db}, info) {
      const emailTaken = db.users.some((user) => user.email === args.data.email);

      if (emailTaken) {
        throw new Error('Email taken');
      }
      const user = {
        id: uuidv4(),
        ...args.data,
      };
      db.users.push(user);

      return user;
    },
    deleteUser(parent, args, {db}, info){
      const userIndx = db.users.findIndex((user)=> user.id === args.id);
      if(userIndx === -1) throw new Error ("no user in the DB");
      const deletedUser = db.users.splice(userIndx, 1);

      db.posts = db.posts.filter(post => {
          const match = post.author === args.id; 
          if(match) db.comments = db.comments.filter(comment => comment.post !== post.id);
          return !match;
      });
      db.comments = db.comments.filter(comment => comment.author !== args.id);
      return deletedUser[0];
    },
    updateUser(parent, args, {db}, info){
      const {id, data} = args;
      const user = db.users.find(user => user.id === id);
      if(!user) throw new Error("user not found");

      if(typeof data.email === "string"){
        const emailTaken = db.users.some(user => user.email === data.email);
        if(emailTaken) throw new Error("email taken");
        user.email = data.email;
      }

      if(typeof data.name === "string") user.name = data.name;
      
      if(typeof data.age !== "undefined") user.age = data.age;

      return user;
    },
    createPost(parent, args, {db, pubsub}, info) {
      const userExists = db.users.some((user) => user.id === args.data.author);
      if (!userExists) throw new Error('User not found');
      const post = {

        id: uuidv4(),
        ...args.data,
      };
      db.posts.push(post);
      //payload shoud an object
      if(post.published) pubsub.publish("post", {
        post: {
          mutation: "CREATED",
          data: post
        }
      });
      return post;
    },
    deletePost(parent, args, {db, pubsub}, info){
      const postIdx = db.posts.findIndex(post => post.id === args.id);
      if(postIdx === -1) throw new Error("wrong post ID");
      const [deletedPost] = db.posts.splice(postIdx, 1);

      db.comments = db.comments.filter(comment => comment.post !== args.id);

      if(deletedPost.published) pubsub.publish("post", {
        post: {
          mutation: "DELETED",
          data: deletedPost
        }
      });
      return deletedPost;
    },
    updatePost(parent, args, {db, pubsub}, info){
      const {id, data} = args;
      const post = db.posts.find(post => post.id === id);
      const originalPost = {...post};
      if(!post) throw new Error("Post not found");

      if(typeof data.title === "string") post.title = data.title;
      if(typeof data.body === "string") post.body = data.body;
      if(typeof data.published === "boolean") {
        post.published = data.published;
        if(originalPost.published && !post.published || !originalPost.published && !post.published){
          pubsub.publish("post", {
            post: {
              mutation: "DELETED",
              data: originalPost
            }
          });
        }else if(!originalPost.published && post.published){
          //created event
          pubsub.publish("post", {
            post: {
              mutation: "CREATED",
              data: post
            }
          });
        }else{
          pubsub.publish("post", {
            post: {
              mutation: "UPDATED",
              data: post
            }
          });
        }
      }else if(originalPost.published){
        //updated
        pubsub.publish("post", {
          post: {
            mutation: "UPDATED",
            data: post
          }
        });
      }

      return post;
    },
    createComment(parent, args, {db, pubsub}, info) {
      const userExists = db.users.some((user) => user.id === args.data.author);
      const postExists = db.posts.some((post) => post.id === args.data.post && post.published);

      if (!userExists || !postExists) {
        throw new Error('Unable to find user and post');
      }

      const comment = {
        id: uuidv4(),
        ...args.data,
      };

      db.comments.push(comment);
      //================================================
      //mutaiton type is now enforsed with only 3 values
      //CREATED, DELETED, UPDATED
      //values used other than these are destined to fail
      //================================================
      pubsub.publish(`comment ${args.data.post}`, {
        comment:{
          mutation: "CREATED",
          data: comment
        }
      });
      return comment;
    },
    deleteComment(parent, args, {db, pubsub}, info){
      const commentId = db.comments.findIndex(comment => comment.id === args.id);
      if(commentId === -1) throw new Error("comment not found");

      const [deletedComment] = db.comments.splice(commentId, 1);

      pubsub.publish(`comment ${deletedComment.post}`, {
        comment: {
          mutation: "DELETED",
          data: deletedComment
        }
      });

      return deletedComment;
      
    },
    updateComment(parent, args, {db, pubsub}, info){
      const {id, data} = args;
      const comment = db.comments.find(comment => comment.id === id);
      if(!comment) throw new Error("no commend with the id provided");
      
      if(typeof data.text === "string") comment.text = data.text;

      pubsub.publish(`comment ${comment.post}`, {
        comment: {
          mutation: "UPDATED",
          data: comment
        }
      });

      return comment;
    }
}
export default Mutation;