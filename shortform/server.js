const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 5173;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  // Mock API proxy for local testing
  if (pathname === '/api/proxy' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        content: [{
          text: `### 📊 알고리즘 핵심 진단 (로컬 AI 시뮬레이션)
- 현재 입력된 지표는 시청자 호기심을 유발하는 데 매우 효과적인 패턴을 보여줍니다.
- 초반 3초 구간의 시청 이탈률을 15% 이내로 방어할 경우, 피드 추천 풀(Pool)이 5배 이상 확장될 수 있습니다.

### 🎯 3초 훅(Hook) 추천 카피 3선
1. **반전형**: "99%가 매일 실수하는 이 방법, 아직도 하고 계신가요?"
2. **질문형**: "왜 똑같이 올려도 내 조회수만 안 나올까? 딱 1가지 차이 때문입니다."
3. **숫자형**: "단 3초 만에 결과가 바뀌는 숏폼 치트키를 공개합니다."

### 🚀 후속 영상 연계 전략
- 동일한 주제를 다루되, 시청자가 댓글로 토론할 수 있는 '논쟁거리'를 결론부에 배치하세요.
- 48시간 내에 2편을 업로드하여 알고리즘 연쇄 추천 알고리즘을 활성화하세요.`
        }]
      }));
    });
    return;
  }

  // Mock API notify for local testing
  if (pathname === '/api/notify' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', msg: 'Local notification received' }));
    return;
  }

  // Static file serving
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(ROOT, pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 [루시안 개발서버] 숏폼 떡상 판독기 Pro 실행 중: http://localhost:${PORT}`);
});
