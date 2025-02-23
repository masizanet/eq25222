let filterKeywords = [];

function loadFilterKeywords() {
  return fetch('/keywords')
    .then(response => response.json())
    .then(keywords => {
      filterKeywords = keywords;
    });
}

function loadPosts() {
  fetch('/admin/posts/data')
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
        if (!post.blocked) {
          const postDiv = document.createElement('div');
          const highlightedContent = highlightKeywords(post.content);
          postDiv.innerHTML = `<p><strong>${post.nickname}</strong>: ${highlightedContent} <button onclick="blockPost('${post.id}')">차단</button></p>`;
          postsDiv.appendChild(postDiv);
        }
      });
    });
}

function loadBlockedPosts() {
  fetch('/admin/posts/data')
    .then(response => response.json())
    .then(posts => {
      const postsDiv = document.getElementById('blockedPosts');
      postsDiv.innerHTML = '';
      posts.filter(post => post.blocked).forEach(post => {
        const postDiv = document.createElement('div');
        const highlightedContent = highlightKeywords(post.content);
        postDiv.innerHTML = `<p><strong>${post.nickname}</strong>: ${highlightedContent} <button onclick="unblockPost('${post.id}')">복원</button> <button onclick="deletePost('${post.id}')">삭제</button></p>`;
        postsDiv.appendChild(postDiv);
      });
    });
}

function highlightKeywords(content) {
  filterKeywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    if (regex.test(content)) {
      console.log(`금기어 "${keyword}"가 포함된 포스트: ${content}`);
    }
    content = content.replace(regex, '<span class="highlight">$1</span>');
  });
  return content;
}

function blockPost(id) {
  fetch(`/posts/${id}/block`, {
    method: 'PUT'
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => { throw new Error(text) });
    }
    return response.text();
  })
  .then(data => {
    console.log(data);
    loadPosts();
    loadBlockedPosts();
  })
  .catch(error => console.error('오류:', error));
}

function unblockPost(id) {
  fetch(`/posts/${id}/unblock`, {
    method: 'PUT'
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => { throw new Error(text) });
    }
    return response.text();
  })
  .then(data => {
    console.log(data);
    loadPosts();
    loadBlockedPosts();
  })
  .catch(error => console.error('오류:', error));
}

function deletePost(id) {
  fetch(`/posts/${id}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => { throw new Error(text) });
    }
    return response.text();
  })
  .then(data => {
    console.log(data);
    localStorage.removeItem(id);
    loadPosts();
    loadBlockedPosts();
  })
  .catch(error => console.error('오류:', error));
}

function addPost() {
  const nickname = document.getElementById('nickname').value;
  const content = document.getElementById('content').value;
  const filteredContent = filterContent(content);
  const post = {
    id: generateUUID(),
    nickname,
    content: filteredContent,
    timestamp: Date.now()
  };

  // 로컬 스토리지에 필터링된 포스트 저장
  localStorage.setItem(post.id, JSON.stringify({
    ...post,
    content: filteredContent
  }));

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

window.onload = () => {
  loadFilterKeywords().then(() => {
    loadPosts();
    loadBlockedPosts();
  });
};
