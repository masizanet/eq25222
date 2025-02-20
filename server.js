const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const Gun = require('gun');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Set up SQLite database
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run('CREATE TABLE posts (id TEXT PRIMARY KEY, author TEXT, content TEXT, timestamp INTEGER)', (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Table created successfully');
        }
    });
});

// Set up Gun.js
const gun = Gun({ web: app.listen(port, () => console.log(`Server running on port ${port}`)) });

// Middleware
app.use(bodyParser.json());
app.use(Gun.serve);

// API Endpoints

// Save a new post
app.post('/api/savePost', (req, res) => {
    const { author, content } = req.body;
    const id = Date.now().toString();
    const timestamp = Date.now();

    db.run('INSERT INTO posts (id, author, content, timestamp) VALUES (?, ?, ?, ?)', [id, author, content, timestamp], (err) => {
        if (err) {
            console.error('Error saving post:', err.message);
            return res.status(500).json({ message: 'Error saving post', error: err.message });
        }

        // Save post to Gun.js
        gun.get('posts').get(id).put({ author, content, timestamp });

        res.status(200).json({ message: 'Post saved' });
    });
});

// Retrieve all posts
app.get('/api/getPosts', (req, res) => {
    db.all('SELECT * FROM posts ORDER BY timestamp DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching posts:', err.message);
            return res.status(500).json({ message: 'Error fetching posts', error: err.message });
        }

        res.status(200).json(rows);
    });
});

// Delete a post
app.delete('/api/deletePost', (req, res) => {
    const { id } = req.query;

    db.run('DELETE FROM posts WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting post:', err.message);
            return res.status(500).json({ message: 'Error deleting post', error: err.message });
        }

        // Delete post from Gun.js
        gun.get('posts').get(id).put(null);

        res.status(200).json({ message: 'Post deleted' });
    });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

console.log(`Gun.js server started on port ${port}`);
