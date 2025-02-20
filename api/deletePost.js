const posts = [];

export default function handler(req, res) {
    if (req.method === 'DELETE') {
        const { id } = req.query;
        const postIndex = posts.findIndex(post => post.id === parseInt(id, 10));
        if (postIndex > -1) {
            posts.splice(postIndex, 1);
            res.status(200).json({ message: 'Post deleted' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
