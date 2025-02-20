import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export default async function handler(req, res) {
    const tmpFilePath = path.join('/tmp', 'posts.json');
    const githubToken = process.env.GITHUB_TOKEN;
    const repo = 'YOUR_GITHUB_USERNAME/YOUR_REPOSITORY';
    const filePathInRepo = 'contents/posts.json';

    try {
        // Read posts from /tmp
        const tmpData = await fs.readFile(tmpFilePath, 'utf8').catch(() => '[]');
        const tmpPosts = JSON.parse(tmpData);

        // Read posts from GitHub
        const githubResponse = await fetch(`https://raw.githubusercontent.com/${repo}/main/${filePathInRepo}`);
        const githubPosts = await githubResponse.json();

        // Merge posts
        const mergedPosts = [...githubPosts, ...tmpPosts];

        // Remove duplicates
        const uniquePosts = Array.from(new Set(mergedPosts.map(post => post.id)))
            .map(id => mergedPosts.find(post => post.id === id));

        // Sort posts by timestamp in descending order
        uniquePosts.sort((a, b) => b.timestamp - a.timestamp);

        res.status(200).json(uniquePosts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
}
