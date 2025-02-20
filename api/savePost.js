import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const post = req.body;
            const filePath = path.join('/tmp', 'posts.json');
            const data = await fs.readFile(filePath, 'utf8');
            const posts = JSON.parse(data);
            posts.push(post);
            await fs.writeFile(filePath, JSON.stringify(posts, null, 2));
            res.status(200).json({ message: 'Post saved' });
        } catch (error) {
            res.status(500).json({ message: 'Error saving post', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
