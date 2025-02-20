import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { id } = req.query;
        const response = await fetch('https://raw.githubusercontent.com/masizanet/eq25222/main/contents/posts.json');
        const posts = await response.json();
        const postIndex = posts.findIndex(post => post.id === parseInt(id, 10));
        if (postIndex > -1) {
            posts.splice(postIndex, 1);

            // Retrieve the SHA of the existing file
            const shaResponse = await fetch('https://api.github.com/repos/masizanet/eq25222/contents/contents/posts.json', {
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`
                }
            });
            const shaData = await shaResponse.json();
            const sha = shaData.sha;

            await fetch('https://api.github.com/repos/masizanet/eq25222/contents/contents/posts.json', {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Delete post',
                    content: Buffer.from(JSON.stringify(posts)).toString('base64'),
                    sha: sha
                })
            });

            res.status(200).json({ message: 'Post deleted' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
