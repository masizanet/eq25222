import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import Gun from 'gun';
import 'gun/lib/path';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            const gun = Gun();
            gun.get('posts').get(id).put(null);

            // Update /tmp directory
            const tmpFilePath = path.join('/tmp', 'posts.json');
            const tmpData = await fs.readFile(tmpFilePath, 'utf8').catch(() => '[]');
            const tmpPosts = JSON.parse(tmpData);
            const postIndex = tmpPosts.findIndex(post => post.id === id);
            if (postIndex > -1) {
                tmpPosts.splice(postIndex, 1);
                await fs.writeFile(tmpFilePath, JSON.stringify(tmpPosts, null, 2));
            }

            // Read posts from GitHub
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

            // Merge posts
            const mergedPosts = [...githubPosts, ...tmpPosts];

            // Remove duplicates
            const uniquePosts = Array.from(new Set(mergedPosts.map(post => post.id)))
                .map(id => mergedPosts.find(post => post.id === id));

            // Push merged posts to GitHub
            await fetch(`https://api.github.com/repos/${repo}/contents/${filePathInRepo}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Delete post',
                    content: Buffer.from(JSON.stringify(uniquePosts)).toString('base64'),
                    sha: sha
                })
            });

            res.status(200).json({ message: 'Post deleted and pushed to GitHub' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting post', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
