// 숏폼 트렌드 통합 대시보드 — 공통 엔진
// 기존 youtube/tiktok/reels-analyzer.html 3개의 로직을 플랫폼 설정(PLATFORMS) 하나로 통합.
// 새 플랫폼을 추가하려면 PLATFORMS에 항목 하나만 더하면 됩니다.

const PROXY_URL = '/api/proxy'
const NOTIFY_URL = '/api/notify'
const HISTORY_KEY = 'shortform-history-v1'
const HISTORY_MAX = 30

const CATEGORIES_BASE = ['뷰티/패션','음식/요리','여행/라이프스타일','교육/정보','엔터테인먼트/유머','피트니스/헬스','비즈니스/마케팅','반려동물','댄스/음악','기타']

const PLATFORMS = {
  youtube: {
    label: '유튜브 쇼츠',
    loadingText: 'AI가 유튜브 숏폼을 분석 중이에요...',
    metricsDesc: '유튜브 스튜디오에서 확인한 수치를 입력하세요',
    scoreDesc: '조회수 대비 좋아요·댓글 비율',
    info: [
      { id: 'videoUrl', label: '유튜브 숏폼 URL', hint: '선택사항', type: 'url', placeholder: 'https://youtube.com/shorts/...' },
      { row: [
        { id: 'creator', label: '채널명', type: 'text', placeholder: '채널 이름' },
        { id: 'uploadDate', label: '업로드 날짜', hint: '선택사항', type: 'date' },
      ]},
      { id: 'title', label: '영상 제목', type: 'text', placeholder: '영상 제목을 그대로 붙여넣으세요' },
      { id: 'description', label: '영상 설명 / 태그', hint: '선택사항', type: 'textarea', placeholder: '영상 설명, 해시태그를 붙여넣으세요' },
      { row: [
        { id: 'category', label: '카테고리', type: 'select', options: ['뷰티/패션','음식/요리','여행/라이프스타일','교육/정보','엔터테인먼트/유머','피트니스/헬스','비즈니스/마케팅','게임','반려동물','댄스/음악','브이로그','기타'] },
        { id: 'duration', label: '영상 길이', type: 'select', options: ['15초 이하','15~30초','30~45초','45~60초'] },
      ]},
    ],
    metrics: [
      { id: 'views', label: '조회수', unit: '회' },
      { id: 'likes', label: '좋아요', unit: '개' },
      { id: 'comments', label: '댓글', unit: '개' },
      { id: 'subscribers', label: '구독자 수', unit: '명' },
      { id: 'newSubs', label: '신규 구독자', hint: '이 영상으로', unit: '명' },
      { id: 'watchTime', label: '평균 시청 지속시간', hint: '선택사항', unit: '%', max: 100 },
    ],
    requireOneOf: ['title', 'views'],
    requireMsg: '제목 또는 성과 지표를 최소 하나 입력해주세요!',
    engagement: d => d.views ? Math.min(((d.likes + d.comments * 2) / d.views) * 100, 100).toFixed(2) : null,
    engThresholds: [5, 2, 1],
    historyTitle: d => d.title || d.videoUrl || '제목 없음',
    insights(d) {
      return [
        { label: '조회수', value: fmt(d.views), sub: '총 노출' },
        { label: '좋아요율', value: d.views ? ((d.likes / d.views) * 100).toFixed(1) + '%' : '–', sub: fmt(d.likes) + '개' },
        { label: '구독자 전환율', value: d.views && d.newSubs ? ((d.newSubs / d.views) * 100).toFixed(3) + '%' : '–', sub: '신규 ' + fmt(d.newSubs) + '명' },
        { label: '시청 지속시간', value: d.watchTime ? d.watchTime + '%' : '–', sub: '평균 완주율' },
      ]
    },
    prompt(d, engRate) {
      const subRate = d.views && d.newSubs ? ((d.newSubs / d.views) * 100).toFixed(3) : null
      return `당신은 유튜브 숏폼(YouTube Shorts) 콘텐츠 전략 전문가입니다. 아래 영상 데이터를 분석하고 실행 가능한 인사이트를 제공해주세요.

## 영상 정보
- 채널명: ${d.creator || '미입력'}
- URL: ${d.videoUrl || '미입력'}
- 제목: ${d.title || '미입력'}
- 카테고리: ${d.category || '미입력'}
- 영상 길이: ${d.duration || '미입력'}
- 업로드 날짜: ${d.uploadDate || '미입력'}
- 설명/태그: ${d.description || '미입력'}
- 추가 메모: ${d.notes || '없음'}

## 성과 지표
- 조회수: ${fmt(d.views)}
- 좋아요: ${fmt(d.likes)}
- 댓글: ${fmt(d.comments)}
- 구독자 수: ${fmt(d.subscribers)}
- 신규 구독자: ${fmt(d.newSubs)}
- 평균 시청 지속시간: ${d.watchTime ? d.watchTime + '%' : '미입력'}
- 참여율: ${engRate !== null ? engRate + '%' : '계산 불가'}
- 구독자 전환율: ${subRate !== null ? subRate + '%' : '계산 불가'}

## 분석 요청
다음 항목을 한국어로 분석해주세요. 각 섹션 제목은 ### 마크다운 헤딩으로 작성해주세요.

### 📊 종합 성과 평가
이 영상의 전반적인 성과를 2~3문장으로 평가해주세요. 유튜브 숏폼 평균 대비 어느 수준인지 언급해주세요.

### 💡 콘텐츠 강점
이 영상이 잘한 점을 3가지 불릿으로 구체적으로 설명해주세요.

### ⚡ 개선 포인트
조회수, 시청 지속시간, 구독자 전환율 관점에서 개선할 수 있는 구체적인 액션 아이템 3가지를 제시해주세요.

### 🎯 제목 & SEO 전략
현재 제목을 평가하고, 클릭률을 높일 수 있는 개선된 제목 3가지를 제안해주세요. 유튜브 알고리즘 최적화 키워드도 추천해주세요.

### 🖼️ 썸네일 전략
높은 CTR을 위한 썸네일 구성 요소와 전략을 3가지 제안해주세요.

### 🔥 다음 영상 추천 전략
이 채널이 다음에 만들면 좋을 숏폼 콘텐츠 아이디어를 2~3가지 구체적으로 제안해주세요. 제목 후크, 첫 3초 전략, 구독 유도 포인트도 포함해주세요.

마지막에 **핵심 한 줄 요약**을 볼드로 작성해주세요.`
    },
  },

  tiktok: {
    label: '틱톡',
    loadingText: 'AI가 틱톡 콘텐츠를 분석 중이에요...',
    metricsDesc: '영상의 실제 수치를 입력하면 더 정확한 분석을 받을 수 있어요',
    scoreDesc: '조회수 대비 상호작용 비율',
    info: [
      { id: 'videoUrl', label: '틱톡 영상 URL', hint: '선택사항', type: 'url', placeholder: 'https://www.tiktok.com/@username/video/...' },
      { row: [
        { id: 'creator', label: '크리에이터 닉네임', type: 'text', placeholder: '@username' },
        { id: 'uploadDate', label: '업로드 날짜', hint: '선택사항', type: 'date' },
      ]},
      { id: 'caption', label: '영상 제목 / 설명', type: 'textarea', placeholder: '영상 캡션, 해시태그, 설명 텍스트를 그대로 붙여넣으세요' },
      { row: [
        { id: 'category', label: '카테고리 / 니치', type: 'select', options: [...CATEGORIES_BASE.slice(0, 7), '게임', ...CATEGORIES_BASE.slice(7)] },
        { id: 'duration', label: '영상 길이', type: 'select', options: ['15초 이하','15~30초','30~60초','60~90초','90초 이상'] },
      ]},
    ],
    metrics: [
      { id: 'views', label: '조회수', unit: '회' },
      { id: 'likes', label: '좋아요', unit: '개' },
      { id: 'comments', label: '댓글', unit: '개' },
      { id: 'shares', label: '공유', unit: '개' },
      { id: 'saves', label: '저장', unit: '개' },
      { id: 'followers', label: '팔로워 수', unit: '명' },
    ],
    requireOneOf: ['caption', 'views'],
    requireMsg: '캡션 또는 성과 지표를 최소 하나 입력해주세요!',
    engagement: d => d.views ? Math.min(((d.likes + d.comments * 2 + d.shares * 3 + d.saves * 2) / d.views) * 100, 100).toFixed(2) : null,
    engThresholds: [8, 4, 2],
    historyTitle: d => (d.caption || d.videoUrl || '캡션 없음').slice(0, 60),
    insights(d) {
      return [
        { label: '조회수', value: fmt(d.views), sub: '총 노출' },
        { label: '좋아요', value: fmt(d.likes), sub: '좋아요율 ' + (d.views ? ((d.likes / d.views) * 100).toFixed(1) + '%' : '–') },
        { label: '공유', value: fmt(d.shares), sub: '바이럴 지표' },
        { label: '저장', value: fmt(d.saves), sub: '재열람 의도' },
      ]
    },
    prompt(d, engRate) {
      return `당신은 틱톡 숏폼 콘텐츠 전략 전문가입니다. 아래 영상 데이터를 분석하고 실행 가능한 인사이트를 제공해주세요.

## 영상 정보
- 크리에이터: ${d.creator || '미입력'}
- URL: ${d.videoUrl || '미입력'}
- 카테고리: ${d.category || '미입력'}
- 영상 길이: ${d.duration || '미입력'}
- 업로드 날짜: ${d.uploadDate || '미입력'}
- 캡션/해시태그: ${d.caption || '미입력'}
- 추가 메모: ${d.notes || '없음'}

## 성과 지표
- 조회수: ${fmt(d.views)}
- 좋아요: ${fmt(d.likes)}
- 댓글: ${fmt(d.comments)}
- 공유: ${fmt(d.shares)}
- 저장: ${fmt(d.saves)}
- 팔로워 수: ${fmt(d.followers)}
- 참여율: ${engRate !== null ? engRate + '%' : '계산 불가'}

## 분석 요청
다음 항목을 한국어로 분석해주세요. 각 섹션 제목은 ### 마크다운 헤딩으로 작성해주세요.

### 📊 종합 성과 평가
이 영상의 전반적인 성과를 2~3문장으로 평가해주세요.

### 💡 콘텐츠 강점
이 영상이 잘한 점을 3가지 불릿으로 구체적으로 설명해주세요.

### ⚡ 개선 포인트
알고리즘과 참여율 관점에서 개선할 수 있는 구체적인 액션 아이템 3가지를 제시해주세요.

### 🎯 해시태그 전략
현재 해시태그를 평가하고, 더 효과적인 해시태그 조합을 5~8개 추천해주세요.

### 🔥 다음 영상 추천 전략
다음에 만들면 좋을 숏폼 콘텐츠 아이디어를 2~3가지 구체적으로 제안해주세요.

마지막에 **핵심 한 줄 요약**을 볼드로 작성해주세요.`
    },
  },

  reels: {
    label: '인스타 릴스',
    loadingText: 'AI가 릴스를 분석 중이에요...',
    metricsDesc: '인스타그램 인사이트에서 확인한 수치를 입력하세요',
    scoreDesc: '조회수 대비 상호작용 비율',
    info: [
      { id: 'videoUrl', label: '릴스 URL', hint: '선택사항', type: 'url', placeholder: 'https://www.instagram.com/reel/...' },
      { row: [
        { id: 'creator', label: '계정명 (@)', type: 'text', placeholder: '@username' },
        { id: 'uploadDate', label: '업로드 날짜', hint: '선택사항', type: 'date' },
      ]},
      { id: 'caption', label: '릴스 캡션 / 해시태그', type: 'textarea', placeholder: '캡션과 해시태그를 그대로 붙여넣으세요' },
      { row: [
        { id: 'category', label: '카테고리', type: 'select', options: [...CATEGORIES_BASE.slice(0, 7), '인테리어/디자인', ...CATEGORIES_BASE.slice(7)] },
        { id: 'duration', label: '릴스 길이', type: 'select', options: ['15초 이하','15~30초','30~60초','60~90초'] },
      ]},
    ],
    metrics: [
      { id: 'views', label: '조회수', unit: '회' },
      { id: 'likes', label: '좋아요', unit: '개' },
      { id: 'comments', label: '댓글', unit: '개' },
      { id: 'saves', label: '저장', unit: '개' },
      { id: 'shares', label: '공유', unit: '개' },
      { id: 'followers', label: '팔로워 수', unit: '명' },
      { id: 'reach', label: '도달 수', hint: '선택사항', unit: '명' },
      { id: 'newFollowers', label: '신규 팔로워', hint: '이 릴스로', unit: '명' },
    ],
    requireOneOf: ['caption', 'views'],
    requireMsg: '캡션 또는 성과 지표를 최소 하나 입력해주세요!',
    engagement: d => d.views ? Math.min(((d.likes + d.comments * 2 + d.saves * 3 + d.shares * 2) / d.views) * 100, 100).toFixed(2) : null,
    engThresholds: [6, 3, 1.5],
    historyTitle: d => (d.caption || d.videoUrl || '캡션 없음').slice(0, 60),
    insights(d) {
      return [
        { label: '조회수', value: fmt(d.views), sub: '총 노출' },
        { label: '저장율', value: d.views && d.saves ? ((d.saves / d.views) * 100).toFixed(2) + '%' : '–', sub: fmt(d.saves) + '개' },
        { label: '도달', value: fmt(d.reach), sub: '도달 계정 수' },
        { label: '신규 팔로워', value: fmt(d.newFollowers), sub: '팔로워 전환' },
      ]
    },
    prompt(d, engRate) {
      const saveRate = d.views && d.saves ? ((d.saves / d.views) * 100).toFixed(2) : null
      return `당신은 인스타그램 릴스(Reels) 콘텐츠 전략 전문가입니다. 아래 데이터를 분석하고 실행 가능한 인사이트를 제공해주세요.

## 릴스 정보
- 계정: ${d.creator || '미입력'}
- URL: ${d.videoUrl || '미입력'}
- 카테고리: ${d.category || '미입력'}
- 길이: ${d.duration || '미입력'}
- 업로드 날짜: ${d.uploadDate || '미입력'}
- 캡션/해시태그: ${d.caption || '미입력'}
- 추가 메모: ${d.notes || '없음'}

## 성과 지표
- 조회수: ${fmt(d.views)}
- 좋아요: ${fmt(d.likes)}
- 댓글: ${fmt(d.comments)}
- 저장: ${fmt(d.saves)}
- 공유: ${fmt(d.shares)}
- 팔로워 수: ${fmt(d.followers)}
- 도달 수: ${fmt(d.reach)}
- 신규 팔로워: ${fmt(d.newFollowers)}
- 참여율: ${engRate !== null ? engRate + '%' : '계산 불가'}
- 저장율: ${saveRate !== null ? saveRate + '%' : '계산 불가'}

## 분석 요청
다음 항목을 한국어로 분석해주세요. 각 섹션 제목은 ### 마크다운 헤딩으로 작성해주세요.

### 📊 종합 성과 평가
이 릴스의 전반적인 성과를 2~3문장으로 평가해주세요. 인스타 릴스 평균 대비 어느 수준인지 언급해주세요. 특히 저장율과 도달에 주목해주세요.

### 💡 콘텐츠 강점
이 릴스가 잘한 점을 3가지 불릿으로 구체적으로 설명해주세요.

### ⚡ 개선 포인트
저장율, 도달율, 팔로워 전환율 관점에서 개선할 수 있는 구체적인 액션 아이템 3가지를 제시해주세요.

### 🎯 해시태그 & 캡션 전략
현재 해시태그와 캡션을 평가하고, 더 효과적인 조합을 5~8개 추천해주세요. 인스타 알고리즘에 맞는 CTA 문구도 제안해주세요.

### 🔥 다음 릴스 추천 전략
다음에 만들면 좋을 릴스 콘텐츠 아이디어를 2~3가지 구체적으로 제안해주세요.

마지막에 **핵심 한 줄 요약**을 볼드로 작성해주세요.`
    },
  },
}

let currentPlatform = 'youtube'

// ── 유틸 ──────────────────────────────────────────────

function fmt(n) { if (!n) return '0'; if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'; if (n >= 1000) return (n / 1000).toFixed(1) + 'K'; return n.toString() }

function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }

function engLabel(rate, [great, good, ok]) {
  if (rate >= great) return { text: '매우 높음', cls: 'great' }
  if (rate >= good) return { text: '좋음', cls: 'good' }
  if (rate >= ok) return { text: '보통', cls: 'ok' }
  return { text: '개선 필요', cls: 'low' }
}

function renderMarkdown(text) {
  return escapeHtml(text)
    .replace(/### (.+)/g, '<h3>$1</h3>').replace(/## (.+)/g, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)/gm, '<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')
}

// ── 폼 렌더링 ─────────────────────────────────────────

function fieldHtml(f) {
  const hint = f.hint ? ` <span class="hint">${f.hint}</span>` : ''
  let control
  if (f.type === 'textarea') control = `<textarea id="${f.id}" placeholder="${escapeHtml(f.placeholder || '')}"></textarea>`
  else if (f.type === 'select') control = `<select id="${f.id}"><option value="">선택하세요</option>${f.options.map(o => `<option>${o}</option>`).join('')}</select>`
  else control = `<input type="${f.type}" id="${f.id}" placeholder="${escapeHtml(f.placeholder || '')}" />`
  return `<div class="field"><label>${f.label}${hint}</label>${control}</div>`
}

function renderForm() {
  const p = PLATFORMS[currentPlatform]
  document.body.dataset.platform = currentPlatform
  document.getElementById('tabs').innerHTML = Object.entries(PLATFORMS)
    .map(([key, cfg]) => `<button class="tab ${key === currentPlatform ? 'active' : ''}" onclick="switchPlatform('${key}')">${cfg.label}</button>`).join('')
  document.getElementById('metricsDesc').textContent = p.metricsDesc
  document.getElementById('loadingText').textContent = p.loadingText
  document.getElementById('infoFields').innerHTML = p.info
    .map(f => f.row ? `<div class="grid-2" style="margin-bottom:18px">${f.row.map(fieldHtml).join('')}</div>` : fieldHtml(f)).join('')
  document.getElementById('metricFields').innerHTML = p.metrics.map(m => {
    const hint = m.hint ? ` <span class="hint">${m.hint}</span>` : ''
    return `<div class="field"><label>${m.label}${hint}</label><div class="metric-wrap"><input type="number" id="${m.id}" placeholder="0" min="0"${m.max ? ` max="${m.max}"` : ''} /><span class="metric-unit">${m.unit}</span></div></div>`
  }).join('')
  document.getElementById('result').classList.remove('show')
}

function switchPlatform(key) {
  currentPlatform = key
  renderForm()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── 분석 ─────────────────────────────────────────────

function collectData() {
  const p = PLATFORMS[currentPlatform]
  const d = { notes: document.getElementById('notes').value }
  p.info.flatMap(f => f.row || [f]).forEach(f => { d[f.id] = document.getElementById(f.id).value })
  p.metrics.forEach(m => { d[m.id] = parseInt(document.getElementById(m.id).value) || 0 })
  return d
}

async function analyze() {
  const p = PLATFORMS[currentPlatform]
  const d = collectData()
  if (!p.requireOneOf.some(id => d[id])) { alert(p.requireMsg); return }
  const engRate = p.engagement(d)
  document.getElementById('analyzeBtn').disabled = true
  document.getElementById('loading').classList.add('show')
  document.getElementById('result').classList.remove('show')
  try {
    const res = await fetch(PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: p.prompt(d, engRate) }) })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message || json.error || 'API 오류')
    const analysis = json.content[0].text
    renderResult(currentPlatform, d, engRate, analysis)
    saveHistory(currentPlatform, d, engRate, analysis)
    sendNotify(currentPlatform, d, engRate, analysis)
  } catch (e) {
    alert('분석 중 오류가 발생했어요: ' + e.message)
  } finally {
    document.getElementById('analyzeBtn').disabled = false
    document.getElementById('loading').classList.remove('show')
  }
}

function renderResult(platform, d, engRate, analysis) {
  const p = PLATFORMS[platform]
  let html = ''
  if (engRate !== null) {
    const info = engLabel(parseFloat(engRate), p.engThresholds)
    html += `<div class="score-bar"><div class="score-circle ${info.cls}">${engRate}%</div><div class="score-info"><h3>참여율 ${info.text}</h3><p>${p.scoreDesc}</p></div></div>`
  }
  if (d.views > 0) {
    html += `<div class="insight-grid">${p.insights(d).map(i =>
      `<div class="insight-item"><div class="label">${i.label}</div><div class="value">${i.value}</div><div class="sub">${i.sub}</div></div>`).join('')}</div>`
  }
  html += `<div class="section-label">AI 분석 리포트 — ${p.label}</div><div class="analysis-content" id="analysisText">${renderMarkdown(analysis)}</div>`
  document.getElementById('resultContent').innerHTML = html
  document.getElementById('result').classList.add('show')
  document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ── n8n 알림 (api/notify.js 경유 — 웹훅 주소 비노출) ──

async function sendNotify(platform, d, engRate, analysis) {
  try {
    await fetch(NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        title: PLATFORMS[platform].historyTitle(d),
        metrics: { views: d.views, engagement: engRate ? engRate + '%' : '–' },
        analysis,
      }),
    })
  } catch (e) { console.log('알림 전송 실패:', e.message) }
}

// ── 분석 이력 (localStorage) ──────────────────────────

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [] } catch { return [] }
}

function saveHistory(platform, d, engRate, analysis) {
  const list = loadHistory()
  list.unshift({ id: Date.now(), platform, ts: new Date().toISOString(), title: PLATFORMS[platform].historyTitle(d), data: d, engRate, analysis })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)))
  renderHistory()
}

function renderHistory() {
  const list = loadHistory()
  const el = document.getElementById('historyList')
  if (!list.length) { el.innerHTML = '<div class="history-empty">아직 분석 이력이 없어요. 첫 분석을 시작해보세요!</div>'; return }
  el.innerHTML = list.map(h => {
    const date = new Date(h.ts)
    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    return `<div class="history-item" onclick="openHistory(${h.id})">
      <span class="history-badge ${h.platform}">${PLATFORMS[h.platform].label}</span>
      <div class="history-info"><div class="t">${escapeHtml(h.title)}</div><div class="m">${dateStr} · 조회수 ${fmt(h.data.views)} · 참여율 ${h.engRate !== null ? h.engRate + '%' : '–'}</div></div>
      <button class="history-del" onclick="event.stopPropagation();deleteHistory(${h.id})" title="삭제">✕</button>
    </div>`
  }).join('')
}

function openHistory(id) {
  const h = loadHistory().find(x => x.id === id)
  if (!h) return
  renderResult(h.platform, h.data, h.engRate, h.analysis)
}

function deleteHistory(id) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(loadHistory().filter(x => x.id !== id)))
  renderHistory()
}

function clearHistory() {
  if (!confirm('분석 이력을 모두 삭제할까요?')) return
  localStorage.removeItem(HISTORY_KEY)
  renderHistory()
}

// ── 기타 액션 ─────────────────────────────────────────

function copyResult() {
  const el = document.getElementById('analysisText')
  if (!el) return
  navigator.clipboard.writeText(el.innerText).then(() => alert('분석 결과가 클립보드에 복사됐어요!'))
}

function resetForm() {
  renderForm()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── 초기화 ───────────────────────────────────────────
// 구 분석기 주소에서 리다이렉트될 때 ?platform=youtube|tiktok|reels 로 탭 지정
const initialPlatform = new URLSearchParams(location.search).get('platform')
if (PLATFORMS[initialPlatform]) currentPlatform = initialPlatform

renderForm()
renderHistory()
