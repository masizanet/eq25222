import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const post = req.body;
        const response = await fetch('https://raw.githubusercontent.com/masizanet/eq25222/main/contents/posts.json');
        const posts = await response.json();
        posts.push(post);

        await fetch('https://api.github.com/repos/masizanet/eq25222/contents/posts.json', {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Add new post',
                content: Buffer.from(JSON.stringify(posts)).toString('base64'),
                sha: 'SHA_OF_THE_EXISTING_FILE'
            })
        });

        res.status(200).json({ message: 'Post saved' });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
