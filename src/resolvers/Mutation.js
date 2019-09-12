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
    createPost(parent, args, {db}, info) {
      const userExists = db.users.some((user) => user.id === args.data.author);
      if (!userExists) throw new Error('User not found');
      const post = {

        id: uuidv4(),
        ...args.data,
      };

      db.posts.push(post);

      return post;
    },
    deletePost(parent, args, {db}, info){
      const postIdx = db.posts.findIndex(post => post.id === args.id);
      if(postIdx === -1) throw new Error("wrong post ID");
      const deletedPost = db.posts.splice(postIdx, 1);

      db.comments = db.comments.filter(comment => comment.post !== args.id);

      return deletedPost[0];
    },
    createComment(parent, args, {db}, info) {
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

      return comment;
    },
    deleteComment(parent, args, {db}, info){
      const commentId = db.comments.findIndex(comment => comment.id === args.id);
      if(commentId === -1) throw new Error("comment not found");

      const deletedComment = db.comments.splice(commentId, 1);
      return deletedComment[0];
      
    },
}
export default Mutation;