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
            const id = Date.now().toString();
            gun.get('posts').get(id).put(post);

            // Save post to /tmp directory
            const tmpFilePath = path.join('/tmp', 'posts.json');
            const tmpData = await fs.readFile(tmpFilePath, 'utf8').catch(() => '[]');
            const tmpPosts = JSON.parse(tmpData);
            tmpPosts.push({ ...post, id });
            await fs.writeFile(tmpFilePath, JSON.stringify(tmpPosts, null, 2));

            // Log content of /tmp/posts.json
            console.log('Content of /tmp/posts.json after saving:', tmpPosts);

            // Read posts from GitHub
            const githubToken = process.env.GITHUB_TOKEN;
            const repo = process.env.REPO;
            const filePathInRepo = 'contents/posts.json';

            const githubResponse = await fetch(`https://api.github.com/repos/${repo}/contents/${filePathInRepo}`, {
                headers: {
                    'Authorization': `token ${githubToken}`
                }
            });
            if (!githubResponse.ok) {
                throw new Error(`GitHub API responded with status ${githubResponse.status}`);
            }
            const githubData = await githubResponse.json();
            const sha = githubData.sha;

            let githubPosts;
            try {
                githubPosts = await fetch(`https://raw.githubusercontent.com/${repo}/main/${filePathInRepo}`).then(res => res.json());
            } catch (error) {
                githubPosts = [];
            }

            // Log content of GitHub posts
            console.log('Content of GitHub posts:', githubPosts);

            // Merge posts
            const mergedPosts = [...githubPosts, ...tmpPosts];

            // Remove duplicates
            const uniquePosts = Array.from(new Set(mergedPosts.map(post => post.id)))
                .map(id => mergedPosts.find(post => post.id === id));

            // Push merged posts to GitHub
            const pushResponse = await fetch(`https://api.github.com/repos/${repo}/contents/${filePathInRepo}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Add new post',
                    content: Buffer.from(JSON.stringify(uniquePosts)).toString('base64'),
                    sha: sha
                })
            });
            if (!pushResponse.ok) {
                throw new Error(`GitHub API responded with status ${pushResponse.status}`);
            }

            // Log data to console
            console.log('Temporary Posts:', tmpPosts);
            console.log('Merged Posts:', uniquePosts);

            res.status(200).json({ message: 'Post saved and pushed to GitHub' });
        } catch (error) {
            console.error('Error saving post:', error);
            res.status(500).json({ message: 'Error saving post', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
