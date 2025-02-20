import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import Gun from 'gun';
import 'gun/lib/path';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const post = req.body;
            const gun = Gun();
            const id = Gun.text.random();
            gun.get('posts').get(id).put(post);

            // Save post to /tmp directory
            const tmpFilePath = path.join('/tmp', 'posts.json');
            const tmpData = await fs.readFile(tmpFilePath, 'utf8').catch(() => '[]');
            const tmpPosts = JSON.parse(tmpData);
            tmpPosts.push({ ...post, id });
            await fs.writeFile(tmpFilePath, JSON.stringify(tmpPosts, null, 2));

            // Push to GitHub
            const githubToken = process.env.GITHUB_TOKEN;
            const repo = process.env.REPO;
            const filePathInRepo = 'contents/posts.json';

            const githubResponse = await fetch(`https://api.github.com/repos/${repo}/contents/${filePathInRepo}`, {
                headers: {
                    'Authorization': `token ${githubToken}`
                }
            });
            const githubData = await githubResponse.json();
            const sha = githubData.sha;

            const githubPosts = await fetch(`https://raw.githubusercontent.com/${repo}/main/${filePathInRepo}`).then(res => res.json());
            githubPosts.push({ ...post, id });

            await fetch(`https://api.github.com/repos/${repo}/contents/${filePathInRepo}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Add new post',
                    content: Buffer.from(JSON.stringify(githubPosts)).toString('base64'),
                    sha: sha
                })
            });

            res.status(200).json({ message: 'Post saved and pushed to GitHub' });
        } catch (error) {
            res.status(500).json({ message: 'Error saving post', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
