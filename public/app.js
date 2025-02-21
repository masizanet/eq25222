function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function createPost() {
  const nickname = document.getElementById('nickname').value;
  const content = document.getElementById('content').value;
  const id = generateUUID();
  const timestamp = Date.now();

  const post = { id, nickname, content, timestamp };

  // 로컬 스토리지에 저장
  localStorage.setItem(id, JSON.stringify(post));

  // 서버로 전송
  fetch('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(post)
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
  })
  .catch(error => {
    alert('오류: ' + error.message);
    console.error('오류:', error);
  });
}

function loadPosts() {
  fetch('/posts')
    .then(response => response.json())
    .then(posts => {
      const postsDiv = document.getElementById('posts');
      postsDiv.innerHTML = '';

      // 서버에서 가져온 포스트 목록과 로컬 스토리지 비교
      const localPosts = Object.keys(localStorage);
      localPosts.forEach(id => {
        try {
          const post = JSON.parse(localStorage.getItem(id));
          if (!posts.some(post => post.id === id)) {
            post.content = "이 글은 관리자가 차단하였습니다";
            localStorage.setItem(id, JSON.stringify(post));
          }
        } catch (e) {
          console.error(`로컬 스토리지에서 포스트를 파싱하는 중 오류 발생: ${e}`);
        }
      });

      posts.forEach(post => {
        const postDiv = document.createElement('div');
        const isAuthor = localStorage.getItem(post.id) !== null;
        postDiv.innerHTML = `<p><strong>${post.nickname}</strong>: ${post.content} ${isAuthor ? `<button onclick="editPost('${post.id}')">수정</button> <button onclick="deletePost('${post.id}')">삭제</button>` : ''}</p>`;
        postsDiv.appendChild(postDiv);
      });

      // 로컬 스토리지의 포스트를 표시
      localPosts.forEach(id => {
        try {
          const post = JSON.parse(localStorage.getItem(id));
          if (post && !posts.some(p => p.id === id)) {
            const postDiv = document.createElement('div');
            postDiv.innerHTML = `<p><strong>${post.nickname}</strong>: ${post.content}</p>`;
            postsDiv.appendChild(postDiv);
          }
        } catch (e) {
          console.error(`로컬 스토리지에서 포스트를 파싱하는 중 오류 발생: ${e}`);
        }
      });
    })
    .catch(error => console.error('포스트를 로드하는 중 오류 발생:', error));
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
    // 로컬 스토리지에서 포스트 삭제
    localStorage.removeItem(id);
    loadPosts();
  })
  .catch(error => console.error('오류:', error));
}

function editPost(id) {
  const post = JSON.parse(localStorage.getItem(id));
  if (!post) {
    alert('포스트를 찾을 수 없습니다.');
    return;
  }

  const newContent = prompt('새로운 내용을 입력하세요:', post.content);
  if (newContent === null) {
    return; // 취소 버튼을 누른 경우
  }

  post.content = newContent;
  localStorage.setItem(id, JSON.stringify(post));

  fetch(`/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(post)
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
  })
  .catch(error => {
    alert('오류: ' + error.message);
    console.error('오류:', error);
  });
}

window.onload = loadPosts;
