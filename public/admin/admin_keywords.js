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
      const filterButtonsDiv = document.getElementById('filterButtons');
      filterButtonsDiv.innerHTML = '';

      // 필터링 버튼 추가
      const alphabetButton = document.createElement('button');
      alphabetButton.innerText = 'A-Z';
      alphabetButton.onclick = () => filterKeywords('alphabet');
      filterButtonsDiv.appendChild(alphabetButton);

      const hangulChars = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
      hangulChars.forEach(char => {
        const button = document.createElement('button');
        button.innerText = char;
        button.onclick = () => filterKeywords(char);
        filterButtonsDiv.appendChild(button);
      });

      keywords.forEach(keyword => {
        const keywordDiv = document.createElement('div');
        keywordDiv.innerHTML = `<p>${keyword} <button onclick="deleteKeyword('${keyword}')">삭제</button></p>`;
        keywordsDiv.appendChild(keywordDiv);
      });
    });
}

function filterKeywords(char) {
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

      // 선택한 문자에 따라 금지어 목록을 필터링
      if (char === 'alphabet') {
        keywords = keywords.filter(keyword => /^[a-zA-Z]/.test(keyword));
      } else {
        const hangulRegex = {
          'ㄱ': /^[가-깋|까-낗]/,
          'ㄴ': /^[나-닣]/,
          'ㄷ': /^[다-딯|따-띻]/,
          'ㄹ': /^[라-맇]/,
          'ㅁ': /^[마-밓]/,
          'ㅂ': /^[바-빟|빠-삫]/,
          'ㅅ': /^[사-싷|싸-쓧]/,
          'ㅇ': /^[아-잏]/,
          'ㅈ': /^[자-짛|짜-찧]/,
          'ㅊ': /^[차-칳]/,
          'ㅋ': /^[카-킿]/,
          'ㅌ': /^[타-팋]/,
          'ㅍ': /^[파-핗]/,
          'ㅎ': /^[하-힣]/
        };
        keywords = keywords.filter(keyword => hangulRegex[char].test(keyword));
      }

      if (keywords.length === 0) {
        keywordsDiv.innerHTML = `<p>해당하는 단어가 없습니다. '${document.getElementById('searchKeyword').value}'를 추가하시겠습니까? <button onclick="addKeyword()">추가</button></p>`;
      } else {
        keywords.forEach(keyword => {
          const keywordDiv = document.createElement('div');
          keywordDiv.innerHTML = `<p>${keyword} <button onclick="deleteKeyword('${keyword}')">삭제</button></p>`;
          keywordsDiv.appendChild(keywordDiv);
        });
      }
    });
}

function searchKeywords() {
  const searchKeyword = document.getElementById('searchKeyword').value.toLowerCase();
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

      // 검색어에 따라 금지어 목록을 필터링
      keywords = keywords.filter(keyword => keyword.toLowerCase().includes(searchKeyword));

      if (keywords.length === 0) {
        keywordsDiv.innerHTML = `<p>해당하는 단어가 없습니다. '${searchKeyword}'를 추가하시겠습니까? <button onclick="addKeyword()">추가</button></p>`;
      } else {
        keywords.forEach(keyword => {
          const keywordDiv = document.createElement('div');
          keywordDiv.innerHTML = `<p>${keyword} <button onclick="deleteKeyword('${keyword}')">삭제</button></p>`;
          keywordsDiv.appendChild(keywordDiv);
        });
      }
    });
}

function addKeyword() {
  const newKeyword = document.getElementById('searchKeyword').value.replace(/['"]/g, '');
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
    document.getElementById('searchKeyword').value = ''; // 입력 필드 비우기
    loadKeywords();
    highlightNewKeyword(newKeyword);
  })
  .catch(error => console.error('오류:', error));
}

function addBulkKeywords() {
  const bulkKeywords = document.getElementById('bulkKeywords').value.split(',');
  bulkKeywords.forEach(keyword => {
    const cleanedKeyword = keyword.trim().replace(/['"]/g, '');
    fetch('/keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ keyword: cleanedKeyword })
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
  });
  document.getElementById('bulkKeywords').value = ''; // 입력 필드 비우기
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
    searchKeywords();
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
