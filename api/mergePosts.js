import { promises as fs } from 'fs';
import path from 'path';
import Gun from 'gun';
import 'gun/lib/path';

export default async function handler(req, res) {
    const gun = Gun();
    const posts = [];

    try {
        // Load posts from Gun
        gun.get('posts').map().once((post, id) => {
            if (post) {
                posts.push({ ...post, id });
            }
        });

        // Wait for posts to be loaded
        setTimeout(async () => {
            // Save merged posts to Gun
            posts.forEach(post => {
                gun.get('mergedPosts').get(post.id).put(post);
            });

            res.status(200).json({ message: 'Posts merged' });
        }, 1000);
    } catch (error) {
        res.status(500).json({ message: 'Error merging posts', error: error.message });
    }
}
