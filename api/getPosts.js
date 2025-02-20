import fetch from 'node-fetch';

export default async function handler(req, res) {
    const response = await fetch('https://raw.githubusercontent.com/masizanet/eq25222/main/contents/posts.json');
    const posts = await response.json();
    res.status(200).json(posts);
}
