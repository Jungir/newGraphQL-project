const Subscription = {
    comment: {
        subscribe(parent, {postId}, {db, pubsub}, info){
            const post = db.posts.find(post => post.id === postId && post.published);
           
            if(!post) throw new Error("no post associated with the provided ID");
                                            //channel name
            return pubsub.asyncIterator(`comment ${postId}`);
        }
    },
    post: {
        subscribe(parent, args, {pubsub}, info){
            return pubsub.asyncIterator("post");
        }
    }
}
export default Subscription;