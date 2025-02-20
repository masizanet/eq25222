document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('postForm');
    const postsList = document.getElementById('postsList');
    const nicknames = new Set();

    // Load posts from serverless function
    fetch('/api/getPosts')
        .then(response => response.json())
        .then(posts => {
            posts.forEach(addPostToDOM);
        });

    postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nicknameInput = document.getElementById('nickname');
        const postContentInput = document.getElementById('postContent');
        let nickname = nicknameInput.value.trim();
        const postContent = postContentInput.value.trim();

        if (nicknames.has(nickname)) {
            nickname = `${nickname}_${Math.floor(Math.random() * 1000)}`;
            alert(`Nickname already taken. Suggested nickname: ${nickname}`);
        }

        nicknames.add(nickname);
        const post = { nickname, content: postContent, id: Date.now() };

        // Save post to serverless function
        fetch('/api/savePost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post)
        }).then(() => {
            addPostToDOM(post);
            nicknameInput.value = '';
            postContentInput.value = '';
        });
    });

    function addPostToDOM(post) {
        const postItem = document.createElement('li');
        postItem.textContent = `${post.nickname}: ${post.content}`;
        postItem.dataset.id = post.id;
        postItem.addEventListener('click', () => {
            if (confirm('Do you want to delete this post?')) {
                deletePost(post.id);
            }
        });
        postsList.appendChild(postItem);
    }

    function deletePost(id) {
        fetch(`/api/deletePost?id=${id}`, { method: 'DELETE' })
            .then(() => {
                const postItem = postsList.querySelector(`[data-id="${id}"]`);
                if (postItem) {
                    postsList.removeChild(postItem);
                }
            });
    }
});
