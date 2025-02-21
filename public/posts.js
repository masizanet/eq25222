function loadPosts() {
  fetch('/posts')
    .then(response => {
      if (response.status === 401) {
        window.location.href = '/login';
      }
      return response.json();
    })
    .then(posts => {
      const postsDiv = document.getElementById('posts');
      postsDiv.innerHTML = '';
      posts.forEach(post => {
        const filteredContent = filterContent(post.content);
        const postDiv = document.createElement('div');
        postDiv.innerHTML = `<p><strong>${post.nickname}</strong>: ${filteredContent} <button onclick="deletePost('${post.id}')">삭제</button></p>`;
        postsDiv.appendChild(postDiv);
      });
    });
}

function filterContent(content) {
  const filterKeywords = [
    // ... 금지어 목록 ...
  ];
  filterKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const replacement = '*'.repeat(keyword.length);
    content = content.replace(regex, replacement);
  });
  return content;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function addPost() {
  const nickname = document.getElementById('nickname').value;
  const content = document.getElementById('content').value;
  const post = {
    id: generateUUID(),
    nickname,
    content,
    timestamp: Date.now()
  };

  // 로컬 스토리지에 원문 포스트 저장
  localStorage.setItem(post.id, JSON.stringify(post));

  fetch('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(post)
  })
  .then(response => {
    if (response.status === 401) {
      window.location.href = '/login';
    }
    return response.text();
  })
  .then(data => {
    document.getElementById('content').value = ''; // 입력 필드 비우기
    loadPosts();
  })
  .catch(error => console.error('오류:', error));
}

function deletePost(id) {
  fetch(`/posts/${id}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (response.status === 401) {
      window.location.href = '/login';
    }
    return response.text();
  })
  .then(data => {
    // 로컬 스토리지에서 포스트 삭제
    localStorage.removeItem(id);
    loadPosts();
  })
  .catch(error => console.error('오류:', error));
}

window.onload = loadPosts;
