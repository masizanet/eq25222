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
        const warningText = post.warning ? ' (경고: 부적절한 내용 포함)' : '';
        const postDiv = document.createElement('div');
        postDiv.innerHTML = `<p><strong>${post.nickname}</strong>: ${post.content}${warningText} <button onclick="deletePost('${post.id}')">삭제</button></p>`;
        postsDiv.appendChild(postDiv);
      });
    });
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

  console.log('POST 요청 전송:', post); // 요청 로그 추가

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
    console.log('POST 응답 수신:', data); // 응답 로그 추가
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
