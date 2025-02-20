import Gun from 'gun';
import 'gun/lib/path';

export default async function handler(req, res) {
    const gun = Gun();
    const posts = [];

    try {
        gun.get('posts').map().once((post, id) => {
            if (post) {
                posts.push({ ...post, id });
            }
        });

        // Wait for posts to be loaded
        setTimeout(() => {
            // Sort posts by timestamp in descending order
            posts.sort((a, b) => b.timestamp - a.timestamp);
            res.status(200).json(posts);
        }, 1000);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
}
