function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
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
