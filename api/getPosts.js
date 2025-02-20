import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const filePath = path.join('/tmp', 'posts.json');
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const posts = JSON.parse(data);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
}
