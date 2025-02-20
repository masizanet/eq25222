document.addEventListener('DOMContentLoaded', () => {
    const gun = Gun();
    const postForm = document.getElementById('postForm');
    const postsList = document.getElementById('postsList');
    const authors = new Set();
    const postsMap = new Map();

    // Load saved author
    const savedAuthor = localStorage.getItem('author');
    if (savedAuthor) {
        document.getElementById('author').value = savedAuthor;
    }

    // Load posts from Gun and listen for new posts
    gun.get('posts').map().on((post, id) => {
        if (post) {
            addPostToDOM({ ...post, id });
        }
    });

    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const authorInput = document.getElementById('author');
        const postContentInput = document.getElementById('postContent');
        let author = authorInput.value.trim();
        const postContent = postContentInput.value.trim();

        // Save author to local storage
        localStorage.setItem('author', author);

        if (authors.has(author)) {
            author = `${author}_${Math.floor(Math.random() * 1000)}`;
            alert(`작성자가 이미 사용 중입니다. 추천 작성자: ${author}`);
        }

        authors.add(author);
        const timestamp = Date.now();
        const post = { author, content: postContent, timestamp };

        // Save post to Gun
        gun.get('posts').get(timestamp).put(post);
        authorInput.value = '';
        postContentInput.value = '';

        // Make a POST request to savePost endpoint
        try {
            const response = await fetch('/api/savePost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ author, content: postContent, timestamp })
            });
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            const data = await response.json();
            console.log('Post saved:', data);
        } catch (error) {
            console.error('Error saving post:', error);
        }

        // Fetch and log data from getPosts
        try {
            const response = await fetch('/api/getPosts');
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched Posts:', data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    });

    function addPostToDOM(post) {
        if (postsMap.has(post.id)) return; // Prevent duplicate posts
        postsMap.set(post.id, post);

        const postItem = document.createElement('li');
        postItem.textContent = `${post.author}: ${post.content}`;
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

    // Sort posts by timestamp in descending order
    function sortPosts() {
        const postsArray = Array.from(postsMap.values());
        postsArray.sort((a, b) => b.timestamp - a.timestamp);
        postsList.innerHTML = '';
        postsArray.forEach(post => addPostToDOM(post));
    }

    // Load posts from Gun and sort them
    gun.get('posts').map().once((post, id) => {
        if (post) {
            postsMap.set(id, { ...post, id });
        }
    });

    // Wait for posts to be loaded and then sort them
    setTimeout(sortPosts, 1000);
});
