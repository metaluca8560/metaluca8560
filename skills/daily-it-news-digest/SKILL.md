---
name: daily-it-news-digest
description: >
  매일 오전 10시 AI/테크 IT 뉴스를 자동 수집·요약해서 Notion 저장 + 이메일 발송하는
  멀티 에이전트 파이프라인 스킬. 다음 키워드가 나오면 무조건 이 스킬을 사용한다:
  "IT 뉴스 자동화", "뉴스 다이제스트", "뉴스 수집 스케줄", "매일 뉴스", "뉴스 노션",
  "뉴스 이메일", "IT 뉴스 에이전트", "뉴스 파이프라인", "daily news", "news digest".
  아티팩트 위젯 생성, Make.com 스케줄 설정, 에이전트 구조 수정 요청 모두 이 스킬로 처리한다.
---

# Daily IT News Digest — 멀티 에이전트 파이프라인

## 개요

3단계 파이프라인:
1. **오케스트레이터** — 웹 검색으로 오늘 AI/테크 뉴스 수집 → JSON 요약 생성
2. **서브 에이전트 A (Notion)** — 뉴스 JSON → Notion 페이지 저장
3. **서브 에이전트 B (Gmail)** — 뉴스 JSON → 이메일 드래프트 생성

서브 에이전트 A·B는 `Promise.allSettled`로 **병렬 실행**. 하나 실패해도 나머지 진행.

> **모델 ID에 날짜 접미사를 붙이지 않는다.** `claude-sonnet-5` 처럼 그대로 쓴다.
> `web_search_20260209`는 현행 모델(Sonnet 5 / Opus 5 등)에서만 동작하므로 모델과 짝이다.
> 둘 중 하나만 올리면 맞지 않는다.
>
> **MCP 커넥터는 반쪽만 쓰면 거부된다.** `mcp_servers`를 선언했으면 같은 이름을 가리키는
> `tools: [{ type: "mcp_toolset", mcp_server_name: "..." }]`를 함께 넣어야 한다.
> 베타 플래그 `mcp-client-2025-11-20`도 필요하다 — raw HTTP에서는 요청 본문이 아니라
> `anthropic-beta` 헤더로 보낸다.

---

## 아티팩트 위젯 생성 시 구조

### 1. 오케스트레이터 API 호출

```javascript
// Anthropic API + web_search 툴
{
  model: "claude-sonnet-5",
  max_tokens: 2000,
  system: `당신은 IT 뉴스 큐레이터입니다. 반드시 순수 JSON만 반환:
{"date":"YYYY-MM-DD",
 "ai_news":[{"title":"...","summary":"2-3문장","source":"출처명"}],
 "tech_news":[{"title":"...","summary":"2-3문장","source":"출처명"}]}
ai_news 4개, tech_news 4개.
AI뉴스=LLM/생성AI/로봇/AI정책. 테크뉴스=빅테크/반도체/스타트업.`,
  tools: [{ type: "web_search_20260209", name: "web_search" }],
  messages: [{ role: "user", content: `${TODAY} 최신 AI 및 IT 테크 뉴스를 검색해서 JSON으로 요약해줘.` }]
}
```

응답에서 `content.find(b => b.type === 'text')` 로 JSON 블록 추출.  
`JSON.parse(text.replace(/```json|```/g, '').trim())` 로 파싱.

### 2. 서브 에이전트 A — Notion MCP

```javascript
{
  model: "claude-sonnet-5",
  max_tokens: 800,
  mcp_servers: [{ type: "url", url: "https://mcp.notion.com/mcp", name: "notion-mcp" }],
  tools: [{ type: "mcp_toolset", mcp_server_name: "notion-mcp" }],
  messages: [{
    role: "user",
    content: `제목: 📰 IT 뉴스 요약 - ${TODAY}\n\n${notionContent}\n\n
지시: 워크스페이스에서 뉴스 관련 페이지나 DB를 찾아 저장하거나,
없으면 루트에 새 페이지 생성. AI 뉴스 / 테크 뉴스 섹션으로 구분.
저장 후 페이지 URL 반환.`
  }]
}
```

### 3. 서브 에이전트 B — Gmail MCP

```javascript
{
  model: "claude-sonnet-5",
  max_tokens: 800,
  mcp_servers: [{ type: "url", url: "https://gmailmcp.googleapis.com/mcp/v1", name: "gmail-mcp" }],
  tools: [{ type: "mcp_toolset", mcp_server_name: "gmail-mcp" }],
  messages: [{
    role: "user",
    content: `수신자: ${recipientEmail}
제목: 📰 IT 뉴스 요약 - ${TODAY}
HTML 본문: ${emailHTML}

드래프트로 저장 후 완료 메시지 알려줘.`
  }]
}
```

병렬 실행:
```javascript
const [notionRes, mailRes] = await Promise.allSettled([notionCall(), mailCall()]);
```

---

## 위젯 UI 구조

```
[수신 이메일 입력창]
[▶ 파이프라인 실행 버튼]

[오케스트레이터] ← 웹검색 → JSON 생성
        ↓
[Notion 서브 에이전트] [Gmail 서브 에이전트]  ← 병렬

[실시간 로그창]
[뉴스 다이제스트 프리뷰]
```

UI 상태: `idle → active → done / error` 각 에이전트 카드별 개별 관리.

---

## 이메일 HTML 구조

```
헤더: 다크 배경 (#1a1a1a), 앰버 모노스페이스 태그, 흰 제목
본문: 테두리 카드, AI 뉴스 섹션 (보라), 테크 뉴스 섹션 (초록)
각 아이템: 제목(bold) → 요약(2-3문장) → 출처(monospace, gray)
```

전체 이메일 HTML은 `references/email-template.html` 참고.

---

## 스케줄 자동화 (매일 오전 10시)

### Make.com 시나리오

```
[Schedule: 매일 10:00 KST]
  → [HTTP: Anthropic API — 오케스트레이터]
  → [Router]
       ├─ [HTTP: Notion MCP API]
       └─ [HTTP: Gmail MCP API]
```

**환경변수 세팅 (Make HTTP 모듈)**:
- `x-api-key`: Anthropic API Key (Make Vault에 저장)
- `Content-Type`: `application/json`
- `anthropic-version`: `2023-06-01`
- `anthropic-beta`: `mcp-client-2025-11-20` (MCP 서브 에이전트 호출에 필요)
- Endpoint: `https://api.anthropic.com/v1/messages`

### 크론 대안 (미니PC 로컬)

```bash
# crontab -e
0 10 * * * /usr/bin/python3 /home/user/news_digest.py >> /var/log/news_digest.log 2>&1
```

`news_digest.py` 스크립트는 `references/cron-script.py` 참고.

---

## 커스터마이징 포인트

| 항목 | 변경 방법 |
|------|-----------|
| 뉴스 카테고리 추가 | 오케스트레이터 system prompt에 섹션 추가 |
| 발행 시간 변경 | Make 스케줄 또는 crontab 수정 |
| Notion 저장 위치 고정 | sub-agent 프롬프트에 페이지 ID 명시 |
| 이메일 수신자 복수 | `recipientEmail`을 배열로 처리 |
| 뉴스 아이템 수 조정 | system prompt의 ai_news/tech_news 개수 변경 |

---

## 참고 파일

- `references/email-template.html` — 이메일 HTML 전체 템플릿
- `references/cron-script.py` — 로컬 자동화용 Python 스크립트
