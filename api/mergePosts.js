import { promises as fs } from 'fs';
import path from 'path';
import Gun from 'gun';

export default async function handler(req, res) {
    const gun = Gun();
    const filePath = path.join('/tmp', 'posts.json');

    try {
        // Load posts from Gun
        const gunPosts = [];
        gun.get('posts').map().once((post, id) => {
            if (post) {
                gunPosts.push({ ...post, id });
            }
        });

        // Load posts from server-side file
        const data = await fs.readFile(filePath, 'utf8');
        const serverPosts = JSON.parse(data);

        // Merge posts
        const mergedPosts = [...serverPosts, ...gunPosts];

        // Remove duplicates
        const uniquePosts = Array.from(new Set(mergedPosts.map(post => post.id)))
            .map(id => mergedPosts.find(post => post.id === id));

        // Save merged posts to server-side file
        await fs.writeFile(filePath, JSON.stringify(uniquePosts, null, 2));

        res.status(200).json({ message: 'Posts merged' });
    } catch (error) {
        res.status(500).json({ message: 'Error merging posts', error: error.message });
    }
}
