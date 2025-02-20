const posts = [];

export default function handler(req, res) {
    if (req.method === 'POST') {
        const post = req.body;
        posts.push(post);
        res.status(200).json({ message: 'Post saved' });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
