/**
 * 숏폼 떡상 판독기 Pro — 코어 엔진 (v2)
 * 플랫폼 통합 엔진, 티어 계산 로직, AI 연동 및 로컬 히스토리 관리
 */

const PROXY_URL = '/api/proxy';
const NOTIFY_URL = '/api/notify';
const HISTORY_KEY_V2 = 'shortform-history-v2';
const HISTORY_KEY_V1 = 'shortform-history-v1';
const HISTORY_MAX = 30;

let currentMode = 'quick'; // 'quick' | 'pro'
let currentPlatform = 'youtube'; // 'youtube' | 'reels' | 'tiktok'
let latestResultData = null;

const PLATFORMS_CONFIG = {
  youtube: {
    name: '유튜브 쇼츠',
    icon: '▶️',
    labelShareOrSave: '공유 수',
    labelNewSubs: '신규 구독자 전환',
    secondaryMetricKey: 'watchTime',
    secondaryMetricLabel: '완주율',
    defaultSecVal: '75%',
    calcEng(d) {
      if (!d.views) return 0;
      return ((d.likes + (d.comments || 0) * 2) / d.views) * 100;
    }
  },
  reels: {
    name: '인스타 릴스',
    icon: '📸',
    labelShareOrSave: '저장 수 (알고리즘 핵심)',
    labelNewSubs: '신규 팔로워 전환',
    secondaryMetricKey: 'shares',
    secondaryMetricLabel: '저장율',
    defaultSecVal: '5.2%',
    calcEng(d) {
      if (!d.views) return 0;
      return ((d.likes + (d.comments || 0) * 2 + (d.shares || 0) * 3) / d.views) * 100;
    }
  },
  tiktok: {
    name: '틱톡',
    icon: '🎵',
    labelShareOrSave: '공유/저장 수',
    labelNewSubs: '신규 팔로워 전환',
    secondaryMetricKey: 'shares',
    secondaryMetricLabel: '공유/저장율',
    defaultSecVal: '6.8%',
    calcEng(d) {
      if (!d.views) return 0;
      return ((d.likes + (d.comments || 0) * 2 + (d.shares || 0) * 3) / d.views) * 100;
    }
  }
};

// ── 티어 및 점수 계산 알고리즘 ────────────────────────────
function calculateAlgorithmScore(data) {
  const views = data.views || 0;
  const likes = data.likes || 0;
  const comments = data.comments || 0;
  const shares = data.shares || 0;
  const watchTime = data.watchTime || 0;

  if (views === 0) return { score: 20, tier: 'F', tierTitle: '알고리즘 미아 🧊', tag: '데이터 부족' };

  const engRate = PLATFORMS_CONFIG[currentPlatform].calcEng(data);

  // 기본 점수: 참여율 기반 (0~60점 가중치)
  let baseScore = 0;
  if (engRate >= 12) baseScore = 58;
  else if (engRate >= 8) baseScore = 50 + (engRate - 8) * 2;
  else if (engRate >= 4) baseScore = 38 + (engRate - 4) * 3;
  else if (engRate >= 1.5) baseScore = 24 + (engRate - 1.5) * 5.6;
  else baseScore = Math.max(5, engRate * 15);

  // 완주율 / 체류 가중치 (0~25점)
  let watchScore = 15; // 기본값
  if (watchTime > 0) {
    if (watchTime >= 90) watchScore = 25;
    else if (watchTime >= 70) watchScore = 20;
    else if (watchTime >= 50) watchScore = 14;
    else watchScore = 6;
  }

  // 절대 볼륨 보너스 (0~15점)
  let volumeScore = 0;
  if (views >= 100000) volumeScore = 15;
  else if (views >= 10000) volumeScore = 12;
  else if (views >= 3000) volumeScore = 9;
  else if (views >= 1000) volumeScore = 6;
  else volumeScore = 3;

  let totalScore = Math.min(100, Math.round(baseScore + watchScore + volumeScore));

  // 티어 판정
  let tier = 'C';
  let tierTitle = '스와이프 주의보 ⚠️';
  let tag = '도입부 개선 필요';

  if (totalScore >= 94) {
    tier = 'SSS';
    tierTitle = '알고리즘 폭격기 🚀';
    tag = '상위 0.1% 초대박';
  } else if (totalScore >= 84) {
    tier = 'S';
    tierTitle = '바이럴 챔피언 👑';
    tag = '알고리즘 상위 5%';
  } else if (totalScore >= 70) {
    tier = 'A';
    tierTitle = '잠재적 대박주 ⚡';
    tag = '3초 후크 보강 시 폭발';
  } else if (totalScore >= 50) {
    tier = 'B';
    tierTitle = '착실한 성장형 📈';
    tag = '기본기 탄탄';
  } else if (totalScore >= 30) {
    tier = 'C';
    tierTitle = '스와이프 주의보 ⚠️';
    tag = '도입부 재설계 필수';
  } else {
    tier = 'F';
    tierTitle = '알고리즘 미아 🧊';
    tag = '소재/타겟 전면 점검';
  }

  return { score: totalScore, tier, tierTitle, tag, engRate: engRate.toFixed(2) };
}

// ── 1줄 처방전 생성기 ─────────────────────────────────────
function generatePrescription(tier, data) {
  const category = data.category || '지식/정보';
  const prescriptions = {
    'SSS': [
      `알고리즘 간택 완료! 지금 즉시 같은 시리즈 2편을 업로드해 유입 트래픽을 연쇄 폭발시키세요.`,
      `완벽한 후킹과 완주율입니다. 고정 댓글로 커뮤니티/뉴스레터 유입 링크를 달아 팬덤을 확보하세요.`
    ],
    'S': [
      `참여율이 매우 우수합니다! 영상 마지막 3초에 '저장해두고 다시 보세요' CTA를 넣으면 SSS급으로 직행합니다.`,
      `반응이 뜨겁습니다! 댓글창에 호기심을 유발하는 질문을 하나 던져서 댓글 바이럴을 유도해보세요.`
    ],
    'A': [
      `충분히 터질 수 있는 소재입니다. 도입부 첫 대사를 1.2배속으로 편집하고 텍스트 후크를 더 자극적으로 바꿔보세요.`,
      `지표가 준수합니다! ${category} 타겟층이 공감할 만한 팩트폭격 문구를 썸네일에 얹어보세요.`
    ],
    'B': [
      `기본기는 좋으나 3초 스와이프 이탈이 의심됩니다. 인트로 인사를 빼고 결론부터 바로 보여주세요.`,
      `호흡이 조금 늘어집니다. 컷 편집 간격을 0.5초 줄이고 시각적 줌인/줌아웃 효과를 3초마다 넣어보세요.`
    ],
    'C': [
      `시청자가 3초 안에 스와이프하고 있습니다! '아직도 OO하시나요?' 식의 충격적인 반전문장으로 시작하세요.`,
      `소재가 너무 무난합니다. ${category} 분야에서 대중이 가장 오해하고 있는 논쟁거리로 주제를 좁혀보세요.`
    ],
    'F': [
      `알고리즘 노출이 멈췄습니다. 제목과 첫 대사를 완전히 뒤집거나, 유행하는 BGM을 입혀 재편집 업로드하세요.`,
      `타겟이 불분명합니다. 1명에게 말하듯이 'OO 직장인 필수'처럼 대상을 좁혀서 다시 기획해보세요.`
    ]
  };

  const list = prescriptions[tier] || prescriptions['B'];
  return list[Math.floor(Math.random() * list.length)];
}

// ── 모드 및 플랫폼 전환 ──────────────────────────────────
function switchMode(mode) {
  currentMode = mode;
  document.body.dataset.mode = mode;
  document.getElementById('btnModeQuick').classList.toggle('active', mode === 'quick');
  document.getElementById('btnModePro').classList.toggle('active', mode === 'pro');
  
  const proSection = document.getElementById('proFieldsSection');
  const formBadge = document.getElementById('formHeaderBadge');
  if (mode === 'pro') {
    proSection.style.display = 'block';
    formBadge.textContent = '프로 심층 진단';
    formBadge.classList.add('highlight-badge');
  } else {
    proSection.style.display = 'none';
    formBadge.textContent = '간편 10초 입력';
    formBadge.classList.remove('highlight-badge');
  }
}

function switchPlatform(plat) {
  currentPlatform = plat;
  document.body.dataset.platform = plat;

  // 주소에도 반영한다. 새로고침하거나 북마크로 돌아와도 같은 탭이 열린다.
  // history를 쌓지 않으므로 뒤로 가기 동작은 그대로다.
  const url = new URL(location.href);
  url.searchParams.set('platform', plat);
  history.replaceState(null, '', url);
  
  document.querySelectorAll('.plat-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.platform === plat);
  });

  const cfg = PLATFORMS_CONFIG[plat];
  document.getElementById('labelShareOrSave').textContent = cfg.labelShareOrSave;
  document.getElementById('labelNewSubs').textContent = cfg.labelNewSubs;
}

// ── 진단 실행 (Analyze) ──────────────────────────────────
async function runDiagnosis() {
  const title = document.getElementById('videoTitle').value.trim();
  const views = parseInt(document.getElementById('metricViews').value) || 0;
  const likes = parseInt(document.getElementById('metricLikes').value) || 0;
  const comments = parseInt(document.getElementById('metricComments')?.value) || 0;
  const shares = parseInt(document.getElementById('metricShares')?.value) || 0;
  const watchTime = parseInt(document.getElementById('metricWatchTime')?.value) || 0;
  const newSubs = parseInt(document.getElementById('metricNewSubs')?.value) || 0;
  const category = document.getElementById('videoCategory').value;
  const duration = document.getElementById('videoDuration').value;
  const notes = document.getElementById('videoNotes')?.value || '';

  if (!title) {
    alert('영상 제목 또는 한 줄 설명을 입력해주세요!');
    return;
  }

  const inputData = {
    title, views, likes, comments, shares, watchTime, newSubs, category, duration, notes,
    platform: currentPlatform,
    mode: currentMode
  };

  // UI 로딩 시작
  document.getElementById('btnSubmit').disabled = true;
  document.getElementById('loadingBox').style.display = 'block';
  document.getElementById('resultContainer').style.display = 'none';
  document.getElementById('loadingBox').scrollIntoView({ behavior: 'smooth', block: 'center' });

  // 1. 알고리즘 티어 & 1줄 처방전 계산
  const { score, tier, tierTitle, tag, engRate } = calculateAlgorithmScore(inputData);
  const prescription = generatePrescription(tier, inputData);

  // 2. 플랫폼 세부 지표 라벨 구성
  const cfg = PLATFORMS_CONFIG[currentPlatform];
  let secMetricLabel = cfg.secondaryMetricLabel;
  let secMetricValue = cfg.defaultSecVal;
  if (watchTime > 0) secMetricValue = watchTime + '%';
  else if (shares > 0 && views > 0) secMetricValue = ((shares / views) * 100).toFixed(2) + '%';

  const resultBundle = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    platform: currentPlatform,
    platformLabel: cfg.name,
    title,
    tier,
    tierTitle,
    tierTag: tag,
    score,
    views,
    likes,
    comments,
    shares,
    watchTime,
    newSubs,
    category,
    duration,
    engagementRate: engRate + '%',
    secondaryMetricLabel: secMetricLabel,
    secondaryMetricValue: secMetricValue,
    prescription,
    analysisText: ''
  };

  latestResultData = resultBundle;

  // 3. AI 심층 리포트 요청 (Pro 모드이거나 백엔드 연결 시)
  try {
    let aiReportMarkdown = '';
    if (currentMode === 'pro') {
      aiReportMarkdown = await fetchAiConsulting(inputData, resultBundle);
    } else {
      aiReportMarkdown = buildQuickAiSummary(resultBundle);
    }
    resultBundle.analysisText = aiReportMarkdown;
  } catch (err) {
    resultBundle.analysisText = buildQuickAiSummary(resultBundle);
  } finally {
    document.getElementById('btnSubmit').disabled = false;
    document.getElementById('loadingBox').style.display = 'none';
    
    // 4. 화면 렌더링 & 캔버스 그리기
    renderResultUI(resultBundle);
    saveToHistory(resultBundle);
    sendNotifyQuietly(resultBundle);
  }
}

// ── AI 호출 및 폴백 로직 ──────────────────────────────────
async function fetchAiConsulting(data, result) {
  const prompt = `당신은 ${result.platformLabel} 콘텐츠 알고리즘 수석 전략가입니다. 아래 데이터를 바탕으로 실전 떡상 컨설팅 리포트를 작성해주세요.

## 영상 기본 정보
- 제목: ${data.title}
- 카테고리: ${data.category} / 영상길이: ${data.duration}
- 성과: 조회수 ${data.views}회, 좋아요 ${data.likes}개, 댓글 ${data.comments}개, 공유/저장 ${data.shares}개, 완주율 ${data.watchTime}%
- 산출 점수: ${result.score}점 (${result.tier}등급 - ${result.tierTitle})
- 추가 메모: ${data.notes || '없음'}

## 요청 항목 (마크다운 포맷)
### 📊 알고리즘 핵심 진단
현재 영상의 강점과 이탈 요인을 냉철하게 분석해주세요.

### 🎯 3초 훅(Hook) & 대본 리라이팅
현재 제목/대본을 떡상시키는 구체적인 첫 3초 도입부 카피 3가지를 제안해주세요.

### 🚀 다음 영상 연계 전략
이 영상의 유입 트래픽을 팬덤으로 바꾸는 후속 콘텐츠 기획을 2가지 추천해주세요.`;

  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  
  if (!res.ok) throw new Error('API 응답 없음');
  const json = await res.json();
  return json.content?.[0]?.text || json.text || buildQuickAiSummary(result);
}

function buildQuickAiSummary(r) {
  return `### 📊 알고리즘 종합 진단 (${r.tier}등급 · ${r.score}점)
- 현재 영상의 참여율은 **${r.engagementRate}**로 ${r.tierTitle} 수준에 도달해 있습니다.
- ${r.views >= 5000 ? '기본 노출 풀(Pool)을 확보하였으므로 후속 영상의 체류시간이 핵심입니다.' : '초반 알고리즘 탐색 구간입니다. 첫 3초 이탈률을 낮추는 후킹이 가장 시급합니다.'}

### 💡 3대 핵심 액션 플랜
1. **첫 3초 후킹 강화**: 시청자가 영상을 넘기기 전, 질문이나 반전 비주얼을 배치하세요.
2. **댓글 유도 장치**: 영상 말미에 '여러분은 A vs B 중 어느 쪽인가요?'와 같은 양자택일 질문을 넣으세요.
3. **연계 숏폼 업로드**: 동일한 키워드로 2편을 48시간 내에 업로드해 알고리즘 추천 연쇄를 만드세요.

**🔥 핵심 요약: ${r.prescription}**`;
}

// ── 결과 렌더링 ──────────────────────────────────────────
function renderResultUI(r) {
  const tierGlow = document.getElementById('tierGlow');
  const tierBadge = document.getElementById('tierBadge');
  const tierTitle = document.getElementById('tierTitle');
  const tierTag = document.getElementById('tierTag');
  const tierScore = document.getElementById('tierScore');
  const prescriptionText = document.getElementById('prescriptionText');

  tierBadge.textContent = r.tier;
  tierTitle.textContent = r.tierTitle;
  tierTag.textContent = r.tierTag;
  tierScore.textContent = r.score;
  prescriptionText.textContent = r.prescription;

  // Tier Colors
  const tierColors = {
    'SSS': '#ff0055', 'S': '#f59e0b', 'A': '#3182f6',
    'B': '#10b981', 'C': '#8b5cf6', 'F': '#64748b'
  };
  const color = tierColors[r.tier] || '#f59e0b';
  tierBadge.style.backgroundColor = color;
  tierGlow.style.backgroundColor = color;

  // Key Metrics Grid
  const grid = document.getElementById('resultMetricsGrid');
  grid.innerHTML = `
    <div class="metric-pill">
      <div class="metric-pill-label">조회수</div>
      <div class="metric-pill-value">${CardGenerator.fmtNum(r.views)}</div>
      <div class="metric-pill-sub">총 노출</div>
    </div>
    <div class="metric-pill">
      <div class="metric-pill-label">참여율</div>
      <div class="metric-pill-value">${r.engagementRate}</div>
      <div class="metric-pill-sub">인터랙션</div>
    </div>
    <div class="metric-pill">
      <div class="metric-pill-label">${r.secondaryMetricLabel}</div>
      <div class="metric-pill-value">${r.secondaryMetricValue}</div>
      <div class="metric-pill-sub">핵심 지표</div>
    </div>
  `;

  // AI Report Body
  const aiReportCard = document.getElementById('aiReportCard');
  const aiReportBody = document.getElementById('aiReportBody');
  aiReportBody.innerHTML = renderMarkdown(r.analysisText);
  aiReportCard.style.display = 'block';

  // Draw High-Res Canvas Scorecard
  CardGenerator.draw(r);

  // Show Container
  const container = document.getElementById('resultContainer');
  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── 마크다운 파서 ─────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/### (.+)/g, '<h3>$1</h3>')
    .replace(/## (.+)/g, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// ── 액션 헬퍼 ───────────────────────────────────────────
function copyReportText() {
  const el = document.getElementById('aiReportBody');
  if (!el) return;
  navigator.clipboard.writeText(el.innerText).then(() => {
    alert('📋 AI 컨설팅 리포트 내용이 클립보드에 복사되었습니다!');
  });
}

function resetDiagnosis() {
  document.getElementById('analyzerForm').reset();
  document.getElementById('resultContainer').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── n8n 알림 웹훅 연동 ────────────────────────────────────
async function sendNotifyQuietly(r) {
  try {
    await fetch(NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: r.platform,
        title: r.title,
        tier: r.tier,
        score: r.score,
        metrics: {
          views: r.views,
          engagement: r.engagementRate,
          secondary: r.secondaryMetricValue
        },
        prescription: r.prescription
      })
    });
  } catch (e) {
    // Quiet fail
  }
}

// ── 로컬 히스토리 관리 ────────────────────────────────────
function getHistory() {
  try {
    const v2 = JSON.parse(localStorage.getItem(HISTORY_KEY_V2));
    if (v2 && v2.length) return v2;
    // Fallback: check v1
    const v1 = JSON.parse(localStorage.getItem(HISTORY_KEY_V1));
    return v1 || [];
  } catch {
    return [];
  }
}

function saveToHistory(r) {
  const list = getHistory();
  list.unshift(r);
  localStorage.setItem(HISTORY_KEY_V2, JSON.stringify(list.slice(0, HISTORY_MAX)));
  renderHistoryUI();
}

function renderHistoryUI() {
  const list = getHistory();
  const container = document.getElementById('historyList');
  if (!list || !list.length) {
    container.innerHTML = '<p class="history-empty">아직 판독한 이력이 없습니다. 첫 영상을 분석해보세요!</p>';
    return;
  }

  const tierColors = {
    'SSS': '#ff0055', 'S': '#f59e0b', 'A': '#3182f6',
    'B': '#10b981', 'C': '#8b5cf6', 'F': '#64748b'
  };

  container.innerHTML = list.map(item => {
    const tier = item.tier || 'B';
    const color = tierColors[tier] || '#f59e0b';
    const date = new Date(item.timestamp || item.ts || Date.now());
    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    return `
      <div class="history-item" onclick="openHistoryItem(${item.id})">
        <div class="history-left">
          <div class="history-tier-badge" style="background:${color}">${tier}</div>
          <div class="history-info">
            <div class="history-title">${escapeHtml(item.title || '제목 없음')}</div>
            <div class="history-sub">${dateStr} · 조회수 ${CardGenerator.fmtNum(item.views || item.data?.views || 0)}회 · ${item.score || 70}점</div>
          </div>
        </div>
        <button class="history-del-btn" onclick="event.stopPropagation(); deleteHistoryItem(${item.id})" title="삭제">✕</button>
      </div>
    `;
  }).join('');
}

function openHistoryItem(id) {
  const list = getHistory();
  const item = list.find(x => x.id === id);
  if (!item) return;
  
  if (item.tier) {
    renderResultUI(item);
  } else {
    // V1 legacy structure support
    const legacyBundle = {
      id: item.id,
      timestamp: item.ts,
      platform: item.platform || 'youtube',
      platformLabel: PLATFORMS_CONFIG[item.platform || 'youtube']?.name || '유튜브 쇼츠',
      title: item.title,
      tier: 'A',
      tierTitle: '잠재적 대박주 ⚡',
      tierTag: '과거 분석 데이터',
      score: 75,
      views: item.data?.views || 0,
      likes: item.data?.likes || 0,
      comments: item.data?.comments || 0,
      shares: item.data?.shares || 0,
      watchTime: item.data?.watchTime || 0,
      engagementRate: item.engRate ? item.engRate + '%' : '–',
      secondaryMetricLabel: '완주율',
      secondaryMetricValue: item.data?.watchTime ? item.data.watchTime + '%' : '–',
      prescription: '기존 분석 이력 데이터입니다.',
      analysisText: item.analysis || ''
    };
    renderResultUI(legacyBundle);
  }
}

function deleteHistoryItem(id) {
  const list = getHistory().filter(x => x.id !== id);
  localStorage.setItem(HISTORY_KEY_V2, JSON.stringify(list));
  renderHistoryUI();
}

function clearAllHistory() {
  if (!confirm('판독 이력을 모두 삭제할까요?')) return;
  localStorage.removeItem(HISTORY_KEY_V2);
  localStorage.removeItem(HISTORY_KEY_V1);
  renderHistoryUI();
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── 초기화 ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  CardGenerator.init();
  renderHistoryUI();

  // reels-analyzer.html, tiktok-analyzer.html 같은 진입점이 ?platform=reels 로
  // 넘겨준다. 이 값을 읽지 않으면 어디로 들어오든 유튜브 화면이 떠서,
  // 릴스 분석기를 눌렀는데 유튜브가 나오는 상황이 된다.
  const wanted = new URLSearchParams(location.search).get('platform');
  if (wanted && PLATFORMS_CONFIG[wanted]) switchPlatform(wanted);
});
