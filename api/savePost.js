import Gun from 'gun';
import 'gun/lib/path';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const post = req.body;
            const gun = Gun();
            const id = Gun.text.random();
            gun.get('posts').get(id).put(post);

            res.status(200).json({ message: 'Post saved' });
        } catch (error) {
            res.status(500).json({ message: 'Error saving post', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
