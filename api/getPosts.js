import Gun from 'gun';

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
            res.status(200).json(posts);
        }, 1000);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
}
