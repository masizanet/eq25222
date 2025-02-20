document.addEventListener('DOMContentLoaded', () => {
    const gun = Gun();
    const postForm = document.getElementById('postForm');
    const postsList = document.getElementById('postsList');
    const nicknames = new Set();
    const postsMap = new Map();

    // Load saved nickname
    const savedNickname = localStorage.getItem('nickname');
    if (savedNickname) {
        document.getElementById('nickname').value = savedNickname;
    }

    // Load posts from Gun and listen for new posts
    gun.get('posts').map().on((post, id) => {
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

        // Save nickname to local storage
        localStorage.setItem('nickname', nickname);

        if (nicknames.has(nickname)) {
            nickname = `${nickname}_${Math.floor(Math.random() * 1000)}`;
            alert(`닉네임이 이미 사용 중입니다. 추천 닉네임: ${nickname}`);
        }

        nicknames.add(nickname);
        const timestamp = Date.now();
        const post = { nickname, content: postContent, timestamp };

        // Save post to Gun
        gun.get('posts').get(timestamp).put(post);
        nicknameInput.value = '';
        postContentInput.value = '';
    });

    function addPostToDOM(post) {
        if (postsMap.has(post.id)) return; // Prevent duplicate posts
        postsMap.set(post.id, post);

        const postItem = document.createElement('li');
        postItem.textContent = `${post.nickname}: ${post.content}`;
        postItem.dataset.id = post.id;
        postItem.addEventListener('click', () => {
            if (confirm('이 게시물을 삭제하시겠습니까?')) {
                deletePost(post.id);
            }
        });

        // Insert the post at the top of the list
        postsList.insertBefore(postItem, postsList.firstChild);
    }

    function deletePost(id) {
        gun.get('posts').get(id).put(null);
        const postItem = postsList.querySelector(`[data-id="${id}"]`);
        if (postItem) {
            postsList.removeChild(postItem);
        }
        postsMap.delete(id);
    }
});
