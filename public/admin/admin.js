function loadKeywords() {
  fetch('/keywords')
    .then(response => {
      if (response.status === 401) {
        window.location.href = '/login';
      }
      return response.json();
    })
    .then(keywords => {
      const keywordsDiv = document.getElementById('keywords');
      keywordsDiv.innerHTML = '';
      keywords.forEach(keyword => {
        const keywordDiv = document.createElement('div');
        keywordDiv.innerHTML = `<p>${keyword} <button onclick="deleteKeyword('${keyword}')">삭제</button></p>`;
        keywordsDiv.appendChild(keywordDiv);
      });
    });
}

function addKeyword() {
  const newKeyword = document.getElementById('newKeyword').value;
  fetch('/keywords', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ keyword: newKeyword })
  })
  .then(response => {
    if (response.status === 401) {
      window.location.href = '/login';
    }
    return response.text();
  })
  .then(data => {
    document.getElementById('newKeyword').value = ''; // 입력 필드 비우기
    loadKeywords();
    highlightNewKeyword(newKeyword);
  })
  .catch(error => console.error('오류:', error));
}

function deleteKeyword(keyword) {
  fetch('/keywords', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ keyword })
  })
  .then(response => {
    if (response.status === 401) {
      window.location.href = '/login';
    }
    return response.text();
  })
  .then(data => {
    loadKeywords();
  })
  .catch(error => console.error('오류:', error));
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    addKeyword();
  }
}

function highlightNewKeyword(keyword) {
  const keywordsDiv = document.getElementById('keywords');
  const keywordDivs = keywordsDiv.getElementsByTagName('div');
  for (let div of keywordDivs) {
    if (div.textContent.includes(keyword)) {
      div.style.backgroundColor = 'yellow';
      setTimeout(() => {
        div.style.backgroundColor = '';
      }, 1000);
      break;
    }
  }
}

window.onload = loadKeywords;
