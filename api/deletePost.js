import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            const filePath = path.join('/tmp', 'posts.json');
            const data = await fs.readFile(filePath, 'utf8');
            const posts = JSON.parse(data);
            const postIndex = posts.findIndex(post => post.id === parseInt(id, 10));
            if (postIndex > -1) {
                posts.splice(postIndex, 1);
                await fs.writeFile(filePath, JSON.stringify(posts, null, 2));
                res.status(200).json({ message: 'Post deleted' });
            } else {
                res.status(404).json({ message: 'Post not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error deleting post', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
