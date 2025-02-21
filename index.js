const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

const app = express();
const db = new sqlite3.Database('./database.sqlite'); // 파일로 데이터베이스 저장

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// 데이터베이스 초기화
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, nickname TEXT, content TEXT, timestamp INTEGER, original_content TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS keywords (keyword TEXT PRIMARY KEY)");
});

// 필터링 키워드 목록을 데이터베이스에서 로드
let filterKeywords = [];
db.all("SELECT keyword FROM keywords", (err, rows) => {
  if (err) {
    console.error("키워드 로드 중 오류 발생:", err);
  } else {
    filterKeywords = rows.map(row => row.keyword);
  }
});

// 포스트 생성 API 엔드포인트
app.post('/posts', (req, res) => {
  let { id, nickname, content, timestamp } = req.body;

  // 필터링 키워드 검사 및 대체
  let filteredContent = content;
  for (let keyword of filterKeywords) {
    const regex = new RegExp(keyword, 'gi');
    const replacement = '*'.repeat(keyword.length);
    filteredContent = filteredContent.replace(regex, replacement);
  }

  const stmt = db.prepare("INSERT INTO posts (id, nickname, content, timestamp, original_content) VALUES (?, ?, ?, ?, ?)");
  stmt.run(id, nickname, filteredContent, timestamp, content, (err) => {
    if (err) {
      return res.status(500).send("포스트 저장 중 오류 발생");
    }
    res.status(200).send("포스트 저장 완료");
  });
  stmt.finalize();
});

// 모든 포스트 조회 API 엔드포인트
app.get('/posts', (req, res) => {
  db.all("SELECT * FROM posts ORDER BY timestamp DESC", (err, rows) => {
    if (err) {
      return res.status(500).send("포스트 조회 중 오류 발생");
    }
    res.status(200).json(rows);
  });
});

// 포스트 삭제 API 엔드포인트
app.delete('/posts/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM posts WHERE id = ?", id, (err) => {
    if (err) {
      return res.status(500).send("포스트 삭제 중 오류 발생");
    }
    res.status(200).send("포스트 삭제 완료");
  });
});

// 포스트 차단 API 엔드포인트
app.put('/posts/:id/block', (req, res) => {
  const { id } = req.params;
  db.run("UPDATE posts SET content = ?, original_content = content WHERE id = ?", ["이 글은 관리자에 의해 차단되었습니다", id], (err) => {
    if (err) {
      return res.status(500).send("포스트 차단 중 오류 발생");
    }
    res.status(200).send("포스트 차단 완료");
  });
});

// 포스트 원문 조회 API 엔드포인트
app.get('/posts/:id/original', adminAuth, (req, res) => {
  const { id } = req.params;
  db.get("SELECT original_content FROM posts WHERE id = ?", id, (err, row) => {
    if (err) {
      return res.status(500).send("포스트 조회 중 오류 발생");
    }
    res.status(200).json(row);
  });
});

// 로그인 페이지 제공
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 로그인 처리
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.status(200).send("로그인 성공");
  } else {
    res.status(401).send("로그인 실패");
  }
});

// 로그아웃 처리
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).send("로그아웃 성공");
});

// 관리자 인증 미들웨어
function adminAuth(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/login');
  }
}

// 관리자 페이지 제공
app.get('/admin', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin/index.html'));
});

// 키워드 관리 페이지 제공
app.get('/admin/keywords', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin/admin_keywords.html'));
});

// 포스트 관리 페이지 제공
app.get('/admin/posts', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin/admin_posts.html'));
});

// 필터링 키워드 조회 API 엔드포인트
app.get('/keywords', adminAuth, (req, res) => {
  res.status(200).json(filterKeywords);
});

// 필터링 키워드 추가 API 엔드포인트
app.post('/keywords', adminAuth, (req, res) => {
  const { keyword } = req.body;
  if (!filterKeywords.includes(keyword)) {
    filterKeywords.push(keyword);
    const stmt = db.prepare("INSERT INTO keywords VALUES (?)");
    stmt.run(keyword, (err) => {
      if (err) {
        return res.status(500).send("키워드 저장 중 오류 발생");
      }
      res.status(200).send("키워드 추가 완료");
    });
    stmt.finalize();
  } else {
    res.status(400).send("이미 존재하는 키워드입니다.");
  }
});

// 필터링 키워드 삭제 API 엔드포인트
app.delete('/keywords', adminAuth, (req, res) => {
  const { keyword } = req.body;
  const index = filterKeywords.indexOf(keyword);
  if (index > -1) {
    filterKeywords.splice(index, 1);
    const stmt = db.prepare("DELETE FROM keywords WHERE keyword = ?");
    stmt.run(keyword, (err) => {
      if (err) {
        return res.status(500).send("키워드 삭제 중 오류 발생");
      }
      res.status(200).send("키워드 삭제 완료");
    });
    stmt.finalize();
  } else {
    res.status(400).send("존재하지 않는 키워드입니다.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
