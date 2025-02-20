document.addEventListener('DOMContentLoaded', () => {
    const gun = Gun();
    const postForm = document.getElementById('postForm');
    const postsList = document.getElementById('postsList');
    const nicknames = new Set();

    // Load posts from Gun
    gun.get('posts').map().once((post, id) => {
        if (post) {
            addPostToDOM({ ...post, id });
        }
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
        const post = { nickname, content: postContent, timestamp: Date.now() };

        // Save post to Gun
        const id = Gun.text.random();
        gun.get('posts').get(id).put(post);
        addPostToDOM({ ...post, id });
        nicknameInput.value = '';
        postContentInput.value = '';
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
        gun.get('posts').get(id).put(null);
        const postItem = postsList.querySelector(`[data-id="${id}"]`);
        if (postItem) {
            postsList.removeChild(postItem);
        }
    }
});
