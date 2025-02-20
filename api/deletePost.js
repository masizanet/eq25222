import Gun from 'gun';
import 'gun/lib/path';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            const gun = Gun();
            gun.get('posts').get(id).put(null);
            res.status(200).json({ message: 'Post deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting post', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
