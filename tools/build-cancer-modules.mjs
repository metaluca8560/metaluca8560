// 암종별 Track 모듈 생성기.
// 데이터(MODULES) + 공용 템플릿 → 루트에 cancer-<slug>.html 을 씁니다.
// 새 암종을 추가하려면 MODULES에 항목 하나만 더 넣으면 됩니다.
//
//   node tools/build-cancer-modules.mjs
//
// 계통 색상은 brand/cancer-track-palette.json 의 값을 그대로 씁니다.

import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const palette = JSON.parse(readFileSync(join(root, 'brand/cancer-track-palette.json'), 'utf8'));
const SITE = 'https://luca-darakbang.netlify.app/';

/* ─────────────────────────────────────────────────────────────
   계통별 색상 (라이트/다크). 팔레트 JSON에서 끌어옵니다.
   ───────────────────────────────────────────────────────────── */
function tone(groupCode) {
  const g = palette.groups[groupCode];
  if (!g) throw new Error(`계통 코드 없음: ${groupCode}`);
  return { light: g.ink, dark: g.dark, soft: g.soft, softDark: g.softDark, name: g.name };
}

/* ─────────────────────────────────────────────────────────────
   암종 데이터
   ───────────────────────────────────────────────────────────── */
const MODULES = [
  {
    slug: 'stomach', group: 'G1',
    title: '위암, 왜 내시경일까?',
    heroLine: '위암은 <em>조용히</em> 시작합니다. 그래서 속이 편한 사람도 2년마다 들여다봅니다.',
    minutes: 9,
    glance: [
      ['5위', '2023년 신규 발생 순위'],
      ['78.6%', '5년 상대생존율<br />2019~2023년 진단 기준'],
      ['+20.6%p', '20년 사이 생존율 상승폭. 2001~2005년에는 58.0%였습니다. 위내시경 검진이 자리 잡으면서 일찍 발견되는 비율이 크게 올랐습니다.', 'wide'],
    ],
    organTitle: '위는 무슨 일을 하나',
    organLead: '삼킨 음식을 잠시 담아 두고, 위산과 소화효소로 잘게 풀어 십이지장으로 조금씩 내보냅니다. 강한 산을 담고도 스스로 녹지 않는 것은 안쪽을 덮은 점막이 막아 주기 때문입니다.',
    organNote: '위암은 대부분 이 <b>점막</b>에서 시작합니다. 그래서 안쪽을 직접 들여다보는 내시경이 가장 확실한 방법이 됩니다.',
    defineTitle: '위암이란',
    path: [
      ['정상 점막', '위 안쪽을 덮고 보호하는 층입니다.'],
      ['만성 위축성 위염', '점막이 얇아지고 위산을 내는 세포가 줄어듭니다.'],
      ['장상피화생', '위 점막이 장 점막처럼 바뀝니다. 아직 암은 아닙니다.'],
      ['위암', '점막에서 시작해 위벽 안쪽으로 파고듭니다.'],
    ],
    pathNote: '이 변화는 대개 <b>오랜 세월에 걸쳐</b> 진행됩니다. 중간에 끊어낼 시간이 있다는 뜻입니다.',
    trendTitle: '줄고 있습니다',
    trendBody: '위암은 국내에서 오래 1위를 지키던 암이지만, 발생과 사망 모두 뚜렷하게 줄어드는 흐름입니다. 냉장 보관이 일반화되면서 염장식품 섭취가 줄었고, 위내시경 검진이 자리를 잡았기 때문으로 봅니다.',
    risks: [
      ['헬리코박터 파일로리 감염', 'mod', '국제암연구소가 위암의 1군 발암요인으로 분류했습니다. 국내 성인의 절반 가량이 보유하고 있습니다.'],
      ['짠 음식 · 염장식품', 'mod', '젓갈, 장아찌처럼 소금에 절인 음식입니다.'],
      ['흡연', 'mod', ''],
      ['잦은 음주', 'mod', ''],
      ['만 40세 이상', 'fix', ''],
      ['직계 가족 중 위암 환자', 'fix', ''],
      ['만성 위축성 위염 · 장상피화생', 'fix', '이미 점막이 변한 상태라 더 자주 살핍니다.'],
    ],
    symptomsLead: '<b>초기에는 증상이 없습니다.</b> 아래 신호는 대개 진행된 뒤에 나타나고, 흔한 소화기 증상과 구분되지 않습니다.',
    symptoms: [
      ['소화불량 · 속쓰림', '위염이나 위궤양과 똑같이 느껴집니다.'],
      ['상복부 불편감', '명치 부근이 더부룩합니다.'],
      ['식욕 저하 · 체중 감소', '이유 없이 살이 빠집니다.'],
      ['흑색변 · 빈혈', '출혈이 있으면 변이 검게 나오고 어지럽습니다.'],
      ['구토 · 삼킴 곤란', '통로가 좁아진 경우입니다.'],
      ['조기 포만감', '조금만 먹어도 배가 찹니다.'],
    ],
    preventLead: '위암은 바꿀 수 있는 위험요인이 비교적 뚜렷한 편입니다.',
    prevent: [
      ['헬리코박터 제균', '감염이 확인되고 치료 대상에 해당하면, 약으로 없앱니다. 제균 후 위암 발생이 줄었다는 연구가 이어지고 있습니다.'],
      ['싱겁게 먹기', '염장식품의 빈도를 낮추는 것이 핵심입니다.'],
      ['금연 · 절주', ''],
      ['채소와 과일', ''],
      ['정기 내시경', '위 어떤 것보다 근거가 분명합니다.'],
    ],
    preventNote: '헬리코박터가 있다고 <b>누구나 바로 제균하는 것은 아닙니다.</b> 검사와 치료의 대상 기준이 따로 있으니 진료 시 상의하세요.',
    screening: { yes: true, age: 40, every: '2년', method: '위내시경 검사 (또는 위장조영검사)',
      note: '만 40세 이상이면 2년마다 받을 수 있습니다. 출생 연도가 짝수면 짝수 해에, 홀수면 홀수 해에 대상이 됩니다.' },
    diagnose: [
      ['위내시경', '안쪽을 직접 보고, 의심스러운 곳이 있으면 조직을 뗍니다.'],
      ['조직 검사', '<b>암인지 아닌지는 여기서 결정됩니다.</b>'],
      ['CT 등 영상 검사', '얼마나 퍼졌는지 확인합니다.'],
      ['병기 결정', '치료 방향이 정해집니다.'],
    ],
    stages: [['국한', 97, '위를 벗어나지 않은 상태'], ['국소', 62, '주변 조직·림프절까지'], ['원격', 7, '멀리 떨어진 장기로 전이']],
    stagesNote: '요약병기별 5년 상대생존율(%)의 대략적인 수준입니다. 집계 판본에 따라 값이 조금씩 다릅니다. <b>초기에 찾으면 결과가 완전히 달라집니다.</b>',
    treat: [
      ['내시경 절제', '아주 초기라 점막에 머물러 있으면 내시경으로 병변만 떼어냅니다. 위를 그대로 남깁니다.', '아주 초기'],
      ['수술', '암이 있는 부분이나 위 전체를 절제하고 주변 림프절을 함께 제거합니다. 복강경·로봇 수술이 늘고 있습니다.', '기본이 되는 치료'],
      ['항암 약물', '수술 전후로 쓰거나, 진행된 경우 병을 조절합니다. 검사 결과에 따라 표적치료제나 면역항암제를 함께 쓰기도 합니다.', '수술 전후 · 진행된 경우'],
    ],
    myths: [
      ['속이 편하면 위는 괜찮다', '초기 위암은 아무 증상이 없습니다. 반대로 속이 자주 쓰린 사람 대부분은 위염이지 암이 아닙니다. 증상은 위 상태를 알려 주는 지표가 못 됩니다. 그래서 증상과 무관하게 주기적으로 들여다봅니다.'],
      ['위암은 무조건 위를 다 잘라낸다', '아주 초기에 발견하면 내시경으로 병변만 떼고 위를 그대로 두는 경우가 있습니다. 수술을 하더라도 위 전체가 아니라 일부만 절제하는 경우가 많습니다. 어디까지 잘라낼지는 위치와 병기에 따라 정해집니다.'],
      ['헬리코박터가 있으면 곧 위암이다', '국내 성인의 상당수가 보유하고 있지만 그 대부분은 위암에 걸리지 않습니다. 위험을 높이는 요인인 것은 분명하나 확정된 미래는 아닙니다. 검사와 제균 대상 기준이 따로 있으니 진료에서 확인하세요.'],
    ],
    summary: [
      ['위암은 조용히 시작합니다.', '초기에는 증상이 없고, 있어도 흔한 소화기 증상과 구분되지 않습니다.'],
      ['만 40세부터 2년마다 위내시경을 받을 수 있습니다.', '국가암검진에 포함돼 있습니다.'],
      ['생존율이 20년 사이 20.6%p 올랐습니다.', '58.0%에서 78.6%로. 일찍 찾아낸 몫이 큽니다.'],
      ['헬리코박터는 1군 발암요인입니다.', '다만 있다고 다 암이 되는 것은 아니고, 제균 대상 기준이 따로 있습니다.'],
      ['초기에 찾으면 위를 남길 수도 있습니다.', '내시경으로 병변만 떼고 끝나는 경우가 있습니다.'],
    ],
    sources: [
      '보건복지부 · 중앙암등록본부, 「2023년 국가암등록통계」 (2025년 12월 공표) — 발생 순위, 5년 상대생존율 78.6%, 2001~2005년 대비 20.6%p 상승',
      '국립암센터 국가암검진사업 — 위암 검진 대상 연령 및 주기',
      '국제암연구소(IARC) — 헬리코박터 파일로리를 위암의 1군 발암요인으로 분류',
      '헬리코박터 제균과 위암 예방에 관한 국내외 연구 — 제균 후 위암 발생 감소 보고. 장기 추적 연구가 진행 중입니다',
    ],
  },

  {
    slug: 'lung', group: 'G5',
    title: '폐암, 담배만의 문제일까?',
    heroLine: '가장 많이 좋아진 암이자, 아직 갈 길이 <em>가장 먼</em> 암입니다.',
    minutes: 10,
    glance: [
      ['2위', '2023년 신규 발생 순위<br />갑상선암 다음'],
      ['42.5%', '5년 상대생존율<br />2019~2023년 진단 기준'],
      ['+25.9%p', '20년 사이 생존율 상승폭으로 모든 암 가운데 가장 큽니다. 저선량 CT 검진이 도입됐고, 표적치료제와 면역항암제가 들어왔기 때문입니다.', 'wide'],
    ],
    organTitle: '폐는 무슨 일을 하나',
    organLead: '들이마신 공기에서 산소를 받아 피에 넘기고, 몸이 만든 이산화탄소를 받아 내보냅니다. 기관지가 나뭇가지처럼 갈라지고 그 끝에 폐포라는 작은 주머니가 3억 개쯤 달려 있습니다.',
    organNote: '폐에는 <b>통증을 느끼는 신경이 거의 없습니다.</b> 종양이 어느 정도 자라도 아프지 않은 이유이고, 초기 발견이 어려운 이유이기도 합니다.',
    defineTitle: '폐암이란',
    path: [
      ['비소세포폐암', '전체의 대부분을 차지합니다. 선암, 편평상피세포암 등이 여기 속합니다.'],
      ['소세포폐암', '자라는 속도가 빠르고 일찍 퍼지는 편이라 치료 방식이 다릅니다.'],
      ['유전자 변이 확인', '비소세포폐암에서는 EGFR, ALK 같은 변이를 찾아 맞는 약을 고릅니다.'],
      ['치료 전략 결정', '같은 폐암이라도 여기서 길이 갈립니다.'],
    ],
    pathNote: '폐암은 <b>하나의 병이 아닙니다.</b> 조직형과 유전자 변이에 따라 쓰는 약이 완전히 달라집니다.',
    trendTitle: '담배를 안 피워도 걸립니다',
    trendBody: '흡연이 가장 큰 위험요인인 것은 분명합니다. 다만 국내 폐암 환자 가운데 담배를 피운 적 없는 사람의 비중이 적지 않고, 특히 여성에서 그렇습니다. 간접흡연, 라돈, 조리 연기, 대기오염 등이 거론되지만 아직 정리되지 않았습니다.',
    trendNote: '그래서 <b>비흡연자라는 이유로 증상을 넘겨서는 안 됩니다.</b> 다만 국가 검진은 흡연력이 많은 사람을 대상으로 설계돼 있습니다.',
    risks: [
      ['흡연', 'mod', '가장 큰 위험요인입니다. 끊은 뒤에도 위험이 서서히 내려갑니다.'],
      ['간접흡연', 'mod', ''],
      ['라돈 노출', 'mod', '토양·암석에서 나오는 방사성 기체입니다. 주택 실내 농도를 측정할 수 있습니다.'],
      ['석면 · 직업적 분진 노출', 'mod', ''],
      ['만성 폐질환', 'fix', '만성폐쇄성폐질환, 폐섬유증 등입니다.'],
      ['직계 가족 중 폐암 환자', 'fix', ''],
      ['나이', 'fix', ''],
    ],
    symptomsLead: '<b>초기에는 증상이 없습니다.</b> 폐에는 통증 신경이 거의 없어 상당히 자란 뒤에야 신호가 나타납니다.',
    symptoms: [
      ['오래가는 기침', '2~3주 이상 이어지거나 평소 기침이 달라집니다.'],
      ['객혈 · 피 섞인 가래', ''],
      ['숨참', '평소 하던 활동에 숨이 찹니다.'],
      ['가슴 · 등 통증', ''],
      ['쉰 목소리', '성대로 가는 신경이 눌린 경우입니다.'],
      ['체중 감소 · 피로', ''],
    ],
    preventLead: '폐암은 <strong>예방으로 줄일 수 있는 몫이 가장 큰 암</strong>에 속합니다.',
    prevent: [
      ['금연', '가장 확실합니다. 끊은 시점부터 위험이 내려가기 시작합니다.'],
      ['간접흡연 피하기', ''],
      ['라돈 확인', '주택 실내 라돈 농도는 측정과 저감이 가능합니다.'],
      ['직업 노출 관리', '석면·분진을 다루는 환경이라면 보호구와 정기 검진이 중요합니다.'],
      ['해당되면 저선량 CT', '고위험군에게는 검진의 근거가 분명합니다.'],
    ],
    screening: { yes: true, age: 54, ageMax: 74, every: '2년', method: '저선량 흉부 CT',
      note: '만 54~74세이면서 30갑년 이상 흡연한 분이 대상입니다. 30갑년은 하루 한 갑씩 30년을 피운 정도를 말합니다. 일반 흉부 X선은 초기 폐암을 놓치는 경우가 많아 검진용으로 쓰지 않습니다.' },
    diagnose: [
      ['영상 검사', '저선량 CT나 흉부 CT로 결절을 확인합니다.'],
      ['조직 검사', '기관지내시경이나 바늘로 조직을 얻습니다. <b>암 진단은 여기서 확정됩니다.</b>'],
      ['유전자 · 단백질 검사', 'EGFR, ALK, PD-L1 등을 확인해 쓸 수 있는 약을 찾습니다.'],
      ['병기 결정', 'PET-CT, 뇌 MRI 등으로 퍼진 범위를 확인합니다.'],
    ],
    stages: [['국한', 78, '폐를 벗어나지 않은 상태'], ['국소', 45, '주변 조직·림프절까지'], ['원격', 12, '멀리 떨어진 장기로 전이']],
    stagesNote: '요약병기별 5년 상대생존율(%)의 대략적인 수준입니다. 집계 판본에 따라 값이 조금씩 다릅니다. 폐암은 <b>원격 전이 상태에서 발견되는 비율이 높은 편</b>이라 전체 생존율이 낮게 나옵니다.',
    treat: [
      ['수술', '초기 비소세포폐암의 기본 치료입니다. 폐엽 단위로 절제하며, 흉강경이나 로봇으로 하는 경우가 많습니다.', '초기'],
      ['방사선', '수술이 어려운 초기 병변에 정밀 방사선을 쓰기도 하고, 항암과 함께 쓰기도 합니다.', '초기~국소진행'],
      ['표적치료', 'EGFR, ALK 같은 변이가 있으면 그 변이를 겨냥한 약을 먹습니다. 잘 맞으면 오래 조절됩니다.', '변이가 있는 경우'],
      ['면역항암제', '암세포가 면역세포의 눈을 피하는 수법을 풀어 줍니다. 진행된 폐암의 장기 생존 사례가 여기서 나왔습니다.', '진행된 경우'],
    ],
    myths: [
      ['담배를 안 피우면 폐암은 남 얘기다', '흡연이 가장 큰 위험요인인 것은 맞지만, 담배를 피운 적 없는 폐암 환자가 적지 않습니다. 특히 여성에서 비중이 큽니다. 비흡연자라는 사실이 오래가는 기침이나 숨참을 넘길 근거가 되지는 못합니다.'],
      ['가슴 X선을 찍었으니 안심이다', '일반 흉부 X선은 작은 초기 폐암을 놓치는 경우가 많습니다. 그래서 고위험군 검진에는 저선량 CT를 씁니다. X선이 깨끗했다는 것이 폐암이 없다는 뜻은 아닙니다.'],
      ['폐암은 걸리면 끝이다', '20년 사이 생존율이 25.9%p 올라 모든 암 가운데 상승폭이 가장 큽니다. 표적치료제와 면역항암제가 들어오면서 예전에는 손쓰기 어렵던 진행 폐암에서도 장기 생존 사례가 나오고 있습니다.'],
    ],
    summary: [
      ['폐에는 통증 신경이 거의 없습니다.', '초기에 증상이 없는 구조적인 이유입니다.'],
      ['가장 크게 좋아진 암입니다.', '20년 사이 생존율이 25.9%p 올랐습니다.'],
      ['담배를 안 피워도 걸립니다.', '비흡연 폐암이 적지 않고, 특히 여성에서 비중이 큽니다.'],
      ['고위험군은 저선량 CT로 검진합니다.', '만 54~74세, 30갑년 이상 흡연자가 대상입니다.'],
      ['같은 폐암이라도 쓰는 약이 다릅니다.', '유전자 변이를 확인해 맞는 치료를 고릅니다.'],
    ],
    sources: [
      '보건복지부 · 중앙암등록본부, 「2023년 국가암등록통계」 (2025년 12월 공표) — 발생 순위 2위, 5년 상대생존율 42.5%, 2001~2005년 대비 25.9%p 상승',
      '국립암센터 국가암검진사업 — 폐암 검진 대상(만 54~74세, 30갑년 이상) 및 저선량 CT 주기',
      '표적치료 및 면역관문억제제 관련 임상 연구 — 진행성 비소세포폐암의 치료 성적 개선',
    ],
  },

  {
    slug: 'liver', group: 'G2',
    title: '간암, 왜 6개월마다일까?',
    heroLine: '간은 <em>아프다는 말을 하지 않습니다.</em> 그래서 위험한 사람은 미리, 자주 들여다봅니다.',
    minutes: 9,
    glance: [
      ['7위', '2023년 신규 발생 순위'],
      ['40.4%', '5년 상대생존율<br />2019~2023년 진단 기준'],
      ['6개월', '고위험군의 검진 주기. 다른 암은 1~2년인데 간암만 6개월인 이유는, 위험한 사람이 누구인지 이미 알고 있고 그 사이에도 빠르게 자랄 수 있기 때문입니다.', 'wide'],
    ],
    organTitle: '간은 무슨 일을 하나',
    organLead: '먹은 것에서 온 영양분을 저장하고 바꿔 쓰고, 약과 알코올을 분해하고, 담즙을 만들어 지방 소화를 돕고, 몸에 필요한 단백질을 만듭니다. 하는 일이 워낙 많아 일부가 망가져도 나머지가 메웁니다.',
    organNote: '간을 <b>침묵의 장기</b>라고 부르는 이유가 여기 있습니다. 상당 부분이 상해도 겉으로 표시가 나지 않아, 증상이 나타났을 때는 이미 진행된 경우가 많습니다.',
    defineTitle: '간암은 대개 예고된 자리에서 생깁니다',
    path: [
      ['만성 간염', 'B형이나 C형 간염 바이러스가 오래 머물며 간에 염증을 일으킵니다.'],
      ['간섬유화', '염증이 반복되면서 간이 딱딱하게 굳어 갑니다.'],
      ['간경변', '간 조직이 광범위하게 굳은 상태입니다. 아직 암은 아닙니다.'],
      ['간세포암', '굳은 간에서 암이 생깁니다.'],
    ],
    pathNote: '간암은 다른 암과 달리 <b>누가 위험한지 미리 알 수 있는 암</b>입니다. 만성 간염과 간경변이라는 뚜렷한 앞 단계가 있기 때문입니다. 검진을 고위험군에 집중하는 이유입니다.',
    trendTitle: '백신이 바꾸고 있습니다',
    trendBody: '국내 간암의 가장 큰 원인은 만성 B형간염입니다. 1990년대부터 신생아 B형간염 예방접종이 자리 잡으면서 젊은 세대의 감염률이 크게 낮아졌고, 시간이 지날수록 간암 발생도 줄어들 것으로 봅니다. 항바이러스 치료가 좋아진 것도 같은 방향으로 작용합니다.',
    trendNote: '다만 최근에는 <b>술과 무관한 지방간</b>에서 시작하는 간암이 늘고 있습니다. 비만과 대사질환이 배경입니다.',
    risks: [
      ['만성 B형간염', 'fix', '국내 간암의 가장 큰 원인입니다. 항바이러스 치료로 관리합니다.'],
      ['만성 C형간염', 'fix', '요즘은 약으로 완치가 가능합니다.'],
      ['간경변', 'fix', '원인과 관계없이 간이 굳은 상태 자체가 위험요인입니다.'],
      ['잦은 음주', 'mod', ''],
      ['비만 · 대사이상 지방간', 'mod', '술을 마시지 않아도 간에 지방이 쌓이는 경우입니다.'],
      ['흡연', 'mod', ''],
      ['직계 가족 중 간암 환자', 'fix', ''],
    ],
    symptomsLead: '<b>초기에는 증상이 없습니다.</b> 간은 상당히 상해도 표시를 내지 않아, 아래 신호가 나타났을 때는 이미 진행된 경우가 많습니다.',
    symptoms: [
      ['피로 · 무기력', '가장 흔하지만 가장 흘려보내기 쉬운 신호입니다.'],
      ['오른쪽 윗배 불편감', '간이 있는 자리입니다.'],
      ['황달', '눈이나 피부가 노랗게 변합니다.'],
      ['복수', '배에 물이 차 불러옵니다.'],
      ['식욕 저하 · 체중 감소', ''],
      ['멍이 잘 듦', '간이 만드는 응고 인자가 줄어든 경우입니다.'],
    ],
    preventLead: '간암은 <strong>원인이 분명한 만큼 막을 여지도 분명한</strong> 암입니다.',
    prevent: [
      ['B형간염 예방접종', '국가예방접종에 포함돼 있습니다. 항체가 없다면 성인도 맞을 수 있습니다.'],
      ['간염 항바이러스 치료', 'B형은 억제, C형은 완치가 가능합니다. 치료가 간암 위험을 낮춥니다.'],
      ['절주', ''],
      ['체중 관리', '지방간에서 시작하는 간암이 늘고 있습니다.'],
      ['해당되면 6개월 검진', '고위험군에게는 이것이 가장 확실합니다.'],
    ],
    preventNote: '<b>본인이 B형·C형 간염 보유자인지 모르는 분이 많습니다.</b> 한 번도 확인한 적이 없다면 혈액검사로 알 수 있습니다.',
    screening: { yes: true, age: 40, every: '6개월', method: '간초음파 + 혈액검사(AFP)', highRiskOnly: true,
      note: '만 40세 이상이면서 간경변증이 있거나 만성 B형·C형 간염을 앓고 있는 분이 대상입니다. 일반 성인은 대상이 아닙니다.' },
    diagnose: [
      ['초음파 · 혈액검사', '검진에서 이상이 보이면 다음 단계로 갑니다.'],
      ['CT · MRI', '간암은 영상에서 보이는 양상이 특징적이라, <b>조직 검사 없이 영상만으로 진단하는 경우가 있습니다.</b>'],
      ['필요 시 조직 검사', '영상으로 확실하지 않을 때 시행합니다.'],
      ['병기와 간 기능 평가', '암의 범위뿐 아니라 남은 간이 얼마나 일하는지도 함께 봅니다.'],
    ],
    diagnoseNote: '간암 치료는 <b>암의 병기와 간 기능을 함께</b> 보고 정합니다. 암을 없앨 수 있어도 남은 간이 버티지 못하면 그 방법을 쓸 수 없기 때문입니다.',
    stages: [['국한', 61, '간을 벗어나지 않은 상태'], ['국소', 22, '주변 조직·림프절까지'], ['원격', 3, '멀리 떨어진 장기로 전이']],
    stagesNote: '요약병기별 5년 상대생존율(%)의 대략적인 수준입니다. 집계 판본에 따라 값이 조금씩 다릅니다. <b>6개월마다 보는 이유가 이 차이에 있습니다.</b>',
    treat: [
      ['수술 절제', '암을 포함한 간 일부를 떼어냅니다. 남은 간이 충분히 일할 수 있어야 가능합니다.', '간 기능이 좋은 초기'],
      ['간 이식', '암과 함께 굳은 간 전체를 바꿉니다. 조건에 맞으면 암과 간경변을 한 번에 해결합니다.', '조건에 맞는 경우'],
      ['색전술 · 고주파 열치료', '간동맥을 막아 종양을 굶기거나, 바늘로 열을 가해 태웁니다. 배를 크게 열지 않습니다.', '수술이 어려운 경우'],
      ['표적 · 면역 약물', '진행된 간암에서 씁니다. 최근 몇 년 사이 선택지가 늘었습니다.', '진행된 경우'],
    ],
    myths: [
      ['간 수치가 정상이면 간은 괜찮다', '흔히 말하는 간 수치는 간세포가 깨질 때 올라가는 값입니다. 간암이 있어도 정상으로 나올 수 있고, 반대로 수치가 올라도 암이 아닌 경우가 훨씬 많습니다. 고위험군에게 초음파를 함께 보는 이유가 여기 있습니다.'],
      ['술을 안 마시면 간암은 없다', '국내 간암의 가장 큰 원인은 술이 아니라 만성 B형간염입니다. 게다가 최근에는 술과 무관한 지방간에서 시작하는 간암이 늘고 있습니다. 금주는 도움이 되지만 그것만으로 안심할 수는 없습니다.'],
      ['B형간염은 물려받는 병이라 어쩔 수 없다', '어머니에게서 아기에게 전달되는 경로가 있는 것은 맞지만, 예방접종으로 막을 수 있고 실제로 국내에서 크게 줄었습니다. 이미 보유자라도 항바이러스 치료로 간암 위험을 낮출 수 있습니다.'],
    ],
    summary: [
      ['간은 아프다는 말을 하지 않습니다.', '상당히 상해도 증상이 없어 초기 발견이 어렵습니다.'],
      ['대신 누가 위험한지는 알 수 있습니다.', '만성 간염과 간경변이라는 뚜렷한 앞 단계가 있습니다.'],
      ['그래서 고위험군은 6개월마다 봅니다.', '다른 암보다 훨씬 짧은 주기입니다.'],
      ['국내 최대 원인은 B형간염입니다.', '예방접종과 항바이러스 치료가 흐름을 바꾸고 있습니다.'],
      ['본인이 보유자인지 모르는 분이 많습니다.', '한 번도 확인한 적이 없다면 혈액검사로 알 수 있습니다.'],
    ],
    sources: [
      '보건복지부 · 중앙암등록본부, 「2023년 국가암등록통계」 (2025년 12월 공표) — 발생 순위, 5년 상대생존율 40.4%, 2001~2005년 대비 19.8%p 상승',
      '국립암센터 국가암검진사업 — 간암 검진 대상(만 40세 이상 고위험군) 및 6개월 주기',
      'B형간염 예방접종 도입 이후 국내 감염률 변화 및 항바이러스 치료와 간암 위험에 관한 연구',
    ],
  },

  {
    slug: 'breast', group: 'G8',
    title: '유방암, 멍울이 없어도?',
    heroLine: '여성에게 가장 많은 암이지만, <em>가장 많이 살아남는</em> 암이기도 합니다.',
    minutes: 10,
    glance: [
      ['4위', '2023년 신규 발생 순위<br />여성만 보면 1위'],
      ['94.7%', '5년 상대생존율<br />2019~2023년 진단 기준'],
      ['2년', '만 40세 이상 여성의 유방촬영 검진 주기. 국가암검진에 포함돼 있어 비용 부담 없이 받을 수 있습니다.', 'wide'],
    ],
    organTitle: '유방은 무슨 일을 하나',
    organLead: '젖을 만드는 <b>소엽</b>과 그 젖이 지나가는 <b>유관</b>, 그리고 이들을 감싸는 지방과 결합조직으로 이루어져 있습니다. 겨드랑이 쪽으로 림프절이 이어져 있습니다.',
    organNote: '유방암의 대부분은 <b>유관</b>에서 시작합니다. 겨드랑이 림프절을 함께 확인하는 이유는 암세포가 그쪽으로 먼저 옮겨가는 경우가 많기 때문입니다.',
    defineTitle: '같은 유방암이라도 서로 다른 병입니다',
    path: [
      ['호르몬 수용체 확인', '여성호르몬에 반응하는 암인지 봅니다. 반응한다면 호르몬 치료가 잘 듣습니다.'],
      ['HER2 확인', '특정 단백질이 많은 유형인지 봅니다. 여기에 맞는 표적치료제가 있습니다.'],
      ['아형 결정', '위 두 가지 조합에 따라 몇 갈래로 나뉩니다.'],
      ['치료 전략', '아형마다 쓰는 약이 다릅니다.'],
    ],
    pathNote: '유방암 진단을 받았다는 사실만으로 치료 방법이 정해지지 않습니다. <b>어떤 아형인지가 실제 치료를 가릅니다.</b>',
    trendTitle: '늘고 있지만 잘 낫습니다',
    trendBody: '국내 유방암 발생은 꾸준히 늘고 있습니다. 늦은 첫 출산, 출산 경험이 없는 경우의 증가, 비만, 서구화된 식습관 등이 배경으로 거론됩니다. 다만 생존율은 94.7%로 매우 높은 편이고, 검진으로 일찍 발견되는 비율도 높습니다.',
    risks: [
      ['여성호르몬에 오래 노출', 'fix', '이른 초경, 늦은 폐경이 해당합니다.'],
      ['늦은 첫 출산 또는 출산 경험 없음', 'fix', ''],
      ['직계 가족 중 유방암 환자', 'fix', 'BRCA 같은 유전자 변이가 확인되는 경우도 있습니다.'],
      ['만 40세 이상', 'fix', ''],
      ['비만', 'mod', '특히 폐경 이후에 영향이 큽니다.'],
      ['음주', 'mod', ''],
      ['운동 부족', 'mod', ''],
      ['장기간 호르몬 대체요법', 'mod', '필요와 위험을 함께 따져 진료에서 결정합니다.'],
    ],
    symptomsLead: '<b>초기에는 증상이 없습니다.</b> 그리고 유방암의 멍울은 대개 <b>아프지 않습니다.</b> 아프지 않다는 사실이 안심할 근거가 되지 못하는 이유입니다.',
    symptoms: [
      ['통증 없는 멍울', '단단하고 잘 움직이지 않는 경우가 많습니다.'],
      ['유두 분비물', '특히 한쪽에서 피가 섞여 나오는 경우입니다.'],
      ['피부 함몰 · 주름', '귤껍질처럼 변하기도 합니다.'],
      ['유두 함몰', '없던 함몰이 새로 생긴 경우입니다.'],
      ['겨드랑이 멍울', '림프절이 커진 경우입니다.'],
      ['유방 크기·모양 변화', '한쪽만 달라집니다.'],
    ],
    preventLead: '바꿀 수 있는 부분과 그렇지 않은 부분이 뚜렷하게 나뉩니다.',
    prevent: [
      ['체중 관리', '특히 폐경 이후 비만이 위험을 높입니다.'],
      ['절주', ''],
      ['꾸준한 신체활동', ''],
      ['모유 수유', '가능한 경우 위험을 낮추는 쪽으로 작용합니다.'],
      ['정기 검진', '위험요인의 상당수가 바꾸기 어려운 만큼 검진의 몫이 큽니다.'],
    ],
    screening: { yes: true, age: 40, every: '2년', method: '유방촬영술 (맘모그래피)', female: true,
      note: '만 40세 이상 여성이 대상입니다. 가족력이 있거나 유전자 변이가 확인된 경우에는 더 이른 나이부터 초음파나 MRI를 함께 권하기도 합니다.' },
    diagnose: [
      ['유방촬영 · 초음파', '검진이나 진료에서 의심스러운 부위를 찾습니다.'],
      ['조직 검사', '바늘로 조직을 얻습니다. <b>암 진단은 여기서 확정됩니다.</b>'],
      ['아형 검사', '호르몬 수용체와 HER2를 확인해 치료 방향을 정합니다.'],
      ['병기 결정', '겨드랑이 림프절과 전이 여부를 확인합니다.'],
    ],
    stages: [['국한', 98, '유방을 벗어나지 않은 상태'], ['국소', 92, '주변 조직·림프절까지'], ['원격', 45, '멀리 떨어진 장기로 전이']],
    stagesNote: '요약병기별 5년 상대생존율(%)의 대략적인 수준입니다. 집계 판본에 따라 값이 조금씩 다릅니다. 유방암은 <b>원격 전이 상태에서도 다른 암에 비해 생존율이 높은 편</b>입니다.',
    treat: [
      ['수술', '유방을 보존하고 종양만 떼어내는 경우가 많습니다. 전체를 절제하는 경우에도 재건 수술을 함께 고려할 수 있습니다.', '기본이 되는 치료'],
      ['방사선', '유방을 보존한 뒤 남은 조직에 시행해 재발을 줄입니다.', '보존 수술 후'],
      ['호르몬 치료', '호르몬 수용체가 있는 유형에서 씁니다. 몇 년에 걸쳐 먹는 약입니다.', '수용체 양성'],
      ['표적 · 항암 약물', 'HER2 양성이면 그에 맞는 표적치료제를 씁니다. 아형과 병기에 따라 항암 약물을 함께 씁니다.', '아형에 따라'],
    ],
    myths: [
      ['안 아프면 유방암이 아니다', '유방암의 멍울은 대개 통증이 없습니다. 오히려 생리 주기에 따라 아팠다 말았다 하는 통증은 암과 관계없는 경우가 많습니다. 통증 여부는 판단 기준이 되지 못합니다.'],
      ['가슴이 작으면 안 걸린다', '유방암은 유관에서 생기고, 유관은 크기와 무관하게 누구에게나 있습니다. 크기는 위험과 관계없습니다. 다만 유방 조직이 치밀한 경우 유방촬영에서 병변이 가려질 수 있어 초음파를 함께 보기도 합니다.'],
      ['남자는 유방암에 안 걸린다', '남성에게도 유관 조직이 있어 유방암이 생길 수 있습니다. 여성에 비해 아주 드물지만 없는 일이 아니고, 드문 만큼 늦게 발견되기 쉽습니다.'],
    ],
    summary: [
      ['여성에게 가장 많은 암입니다.', '그리고 가장 많이 살아남는 암 중 하나입니다. 생존율 94.7%.'],
      ['멍울은 대개 아프지 않습니다.', '통증이 없다는 사실이 안심할 근거가 되지 못합니다.'],
      ['만 40세부터 2년마다 유방촬영을 받을 수 있습니다.', '국가암검진에 포함돼 있습니다.'],
      ['같은 유방암이라도 아형이 다릅니다.', '호르몬 수용체와 HER2에 따라 쓰는 약이 갈립니다.'],
      ['유방을 보존하는 수술이 많습니다.', '전체를 절제하는 경우에도 재건을 함께 고려할 수 있습니다.'],
    ],
    sources: [
      '보건복지부 · 중앙암등록본부, 「2023년 국가암등록통계」 (2025년 12월 공표) — 발생 순위, 5년 상대생존율 94.7%',
      '국립암센터 국가암검진사업 — 유방암 검진 대상(만 40세 이상 여성) 및 2년 주기',
      '호르몬 수용체 및 HER2 상태에 따른 유방암 아형 분류와 치료 전략에 관한 진료 지침',
    ],
  },

];

/* ─────────────────────────────────────────────────────────────
   템플릿
   ───────────────────────────────────────────────────────────── */
const esc = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;');

function render(m) {
  const t = tone(m.group);
  const plain = m.title.replace(/<[^>]+>/g, '');
  const desc = m.heroLine.replace(/<[^>]+>/g, '');
  const og = `cancer-${m.slug}-og.png`;

  const glance = m.glance.map(([v, l, wide]) =>
    `      <div class="gl${wide ? ' wide' : ''}"><span class="v">${v}</span><span class="l">${l}</span></div>`).join('\n');

  const path = m.path.map(([b, s], i) =>
    `      <div class="pth"><span class="n">${i + 1}</span><b>${b}</b><span>${esc(s)}</span></div>`).join('\n');

  const risks = m.risks.map(([label, kind, note]) =>
    `        <label class="risk"><input type="checkbox" data-kind="${kind}" /><span class="txt"><b>${label}</b>` +
    `<span class="kind ${kind}">${kind === 'mod' ? '조절 가능' : '고정'}</span>${note ? ' — ' + esc(note) : ''}</span></label>`).join('\n');

  const symptoms = m.symptoms.map(([n, d]) =>
    `      <div class="sym"><b>${n}</b><span>${esc(d)}</span></div>`).join('\n');

  const prevent = m.prevent.map(([n, d]) =>
    `      <div class="sym"><b>${n}</b><span>${esc(d)}</span></div>`).join('\n');

  const diagnose = m.diagnose.map(([b, s], i) =>
    `      <div class="pth"><span class="n">${i + 1}</span><b>${b}</b><span>${s}</span></div>`).join('\n');

  const stages = m.stages.map(([n, pct, d], i) =>
    `        <div class="stg${i === 2 ? ' low' : ''}"><span class="nm">${n}</span>` +
    `<span class="tr"><i style="width:${pct}%"></i></span><span class="pc">${pct}</span>` +
    `<span class="desc">${d}</span></div>`).join('\n');

  const treat = m.treat.map(([n, d, w]) =>
    `      <div class="txc"><h3>${n}</h3><p>${esc(d)}</p><span class="when">${w}</span></div>`).join('\n');

  const myths = m.myths.map(([claim, fact]) =>
    `      <button class="myth" aria-expanded="false">\n` +
    `        <span class="badge">오해</span>\n` +
    `        <span class="claim">${claim}</span>\n` +
    `        <span class="tap">눌러서 사실 확인 →</span>\n` +
    `        <span class="fact">${esc(fact)}</span>\n` +
    `      </button>`).join('\n');

  const summary = m.summary.map(([b, s]) =>
    `      <li><b>${b}</b> ${esc(s)}</li>`).join('\n');

  const sources = m.sources.map((s) => `    <li>${esc(s)}</li>`).join('\n');

  // 검진 절
  const sc = m.screening;
  const screeningSection = sc.yes ? `
  <section id="s9">
    <p class="step"><b>09</b> 검진</p>
    <h2>검진은 어떻게 받나</h2>
    <p>${m.name || plain.split(',')[0]}은 국가암검진에 포함돼 있습니다. 해당되는지 확인해 보세요.</p>

    <div class="card">
      <div class="field">
        <label for="ageIn">나이 (만)</label>
        <input type="number" id="ageIn" min="0" max="120" value="${sc.age + 5}" inputmode="numeric" />
      </div>
      ${sc.female ? `<div class="field">
        <label>성별</label>
        <div class="seg" id="sexSeg">
          <button data-sex="f" aria-pressed="true">여성</button>
          <button data-sex="m" aria-pressed="false">남성</button>
        </div>
      </div>` : ''}
      <div class="elig" id="elig" role="status" aria-live="polite"></div>
    </div>

    <div class="note amber">${sc.note}</div>
  </section>` : `
  <section id="s9">
    <p class="step"><b>09</b> 검진</p>
    <h2>검진은 어떻게 받나</h2>
    <div class="note amber">${sc.note}</div>
  </section>`;

  const eligScript = sc.yes ? `
  var ageIn = document.getElementById('ageIn');
  var elig = document.getElementById('elig');
  var sexSeg = document.getElementById('sexSeg');
  var sex = 'f';
  function renderElig() {
    var a = parseInt(ageIn.value, 10); if (isNaN(a)) a = 0;
    var ok = a >= ${sc.age}${sc.ageMax ? ` && a <= ${sc.ageMax}` : ''}${sc.female ? ` && sex === 'f'` : ''};
    if (ok) {
      elig.className = 'elig yes';
      elig.innerHTML = '<b>국가암검진 대상입니다.</b> ${sc.every}마다 ${sc.method}를 받을 수 있습니다.${sc.highRiskOnly ? ' 다만 간경변이나 만성 B형·C형 간염에 해당하는 경우에 한합니다.' : ''}';
    } else {
      elig.className = 'elig not';
      ${sc.female ? `if (sex === 'm') { elig.innerHTML = '이 검진은 여성을 대상으로 합니다. 남성에게도 드물게 발생하므로, 이상이 느껴지면 나이·성별과 관계없이 진료를 받으세요.'; return; }` : ''}
      ${sc.ageMax ? `if (a > ${sc.ageMax}) { elig.innerHTML = '국가암검진 대상 연령(만 ${sc.age}~${sc.ageMax}세)을 넘었습니다. <b>검진이 필요 없다는 뜻은 아니므로</b> 진료에서 상의하세요.'; return; }` : ''}
      var left = ${sc.age} - a;
      elig.innerHTML = '아직 국가암검진 대상 연령이 아닙니다. <b>' + left + '년 뒤</b> 대상이 됩니다. ' +
        '가족력이나 기저질환이 있다면 그 전에도 검사를 권하는 경우가 있고, <b>증상이 있다면 나이와 관계없이 진료를 받으셔야 합니다.</b>';
    }
  }
  ageIn.addEventListener('input', renderElig);
  if (sexSeg) sexSeg.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    sex = b.dataset.sex;
    sexSeg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    renderElig();
  });
  renderElig();
` : '';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${plain}</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="${SITE}cancer-${m.slug}.html" />

<meta property="og:type" content="article" />
<meta property="og:site_name" content="디지털다락방" />
<meta property="og:title" content="${plain}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${SITE}cancer-${m.slug}.html" />
<meta property="og:image" content="${SITE}${og}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="ko_KR" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${plain}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${SITE}${og}" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='13' fill='%23${t.light.slice(1)}'/%3E%3Ccircle cx='16' cy='16' r='5' fill='%23D0356A'/%3E%3C/svg%3E" />
<style>
:root {
  --acc:${t.light}; --acc-soft:${t.soft};
  --ground:#FAFAF9; --card:#FFF; --card-2:#F1F0EE;
  --ink:#1F2320; --ink-mid:#4F554F; --ink-soft:#82887F;
  --line:#E3E4E0; --line-firm:#CFD1CB;
  --eosin:#D0356A; --eosin-soft:#FCE7EF; --eosin-ink:#A81D50;
  --amber:#B5760A; --amber-soft:#FBF0DC;
  --on-acc:#FFF;
  --shadow:0 1px 2px rgba(31,35,32,.05),0 8px 24px -12px rgba(31,35,32,.18);
  --sans:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",system-ui,sans-serif;
  --w:34rem; --pad:1.25rem;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --acc:${t.dark}; --acc-soft:${t.softDark};
  --ground:#111310; --card:#191C18; --card-2:#212520;
  --ink:#ECEFEA; --ink-mid:#BCC1BA; --ink-soft:#878E85;
  --line:#2C302B; --line-firm:#3A3F38;
  --eosin:#FF7DA8; --eosin-soft:#3B1B2B; --eosin-ink:#FFA0C0;
  --amber:#E0A94E; --amber-soft:#33260F;
  --on-acc:#0D0F0C;
  --shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px -12px rgba(0,0,0,.6);
}}
:root[data-theme="dark"]{
  --acc:${t.dark}; --acc-soft:${t.softDark};
  --ground:#111310; --card:#191C18; --card-2:#212520;
  --ink:#ECEFEA; --ink-mid:#BCC1BA; --ink-soft:#878E85;
  --line:#2C302B; --line-firm:#3A3F38;
  --eosin:#FF7DA8; --eosin-soft:#3B1B2B; --eosin-ink:#FFA0C0;
  --amber:#E0A94E; --amber-soft:#33260F;
  --on-acc:#0D0F0C;
  --shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px -12px rgba(0,0,0,.6);
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);font-size:16px;
  line-height:1.8;word-break:keep-all;overflow-wrap:break-word;-webkit-font-smoothing:antialiased;
  padding-bottom:env(safe-area-inset-bottom)}
#progress{position:fixed;top:0;left:0;height:3px;width:0%;
  background:linear-gradient(90deg,var(--acc),var(--eosin));z-index:90;transition:width .12s linear}

.hero{position:relative;min-height:64vh;min-height:64svh;display:flex;flex-direction:column;
  justify-content:flex-end;overflow:hidden;background:var(--card-2);padding:0 var(--pad) 3.4rem}
#field{position:absolute;inset:0;width:100%;height:100%;display:block}
.hero-veil{position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(to bottom,color-mix(in srgb,var(--card-2) 15%,transparent) 0%,
  color-mix(in srgb,var(--card-2) 60%,transparent) 48%,
  color-mix(in srgb,var(--card-2) 95%,transparent) 80%,var(--card-2) 100%)}
.hero-inner{position:relative;max-width:var(--w);width:100%;margin:0 auto;display:flex;flex-direction:column;gap:.7rem}
.hero h1{font-size:clamp(2.1rem,9.5vw,3.1rem);font-weight:800;letter-spacing:-.045em;line-height:1.13;margin:.2rem 0 0;text-wrap:balance}
.hero p{margin:0;color:var(--ink-mid);font-size:1.02rem;max-width:27ch}
.hero p em{font-style:normal;font-weight:700;color:var(--acc)}
.hero .meta{margin-top:.5rem;font-size:.78rem;color:var(--ink-soft);letter-spacing:.04em}
.scroll-cue{margin-top:1.4rem;color:var(--ink-soft);display:flex;animation:nudge 2.1s ease-in-out infinite}
@keyframes nudge{0%,100%{transform:translateY(0);opacity:.55}50%{transform:translateY(5px);opacity:1}}

main{max-width:var(--w);margin:0 auto;padding:0 var(--pad) 3rem}
section{padding:3rem 0 0;display:flex;flex-direction:column;gap:1rem;scroll-margin-top:1rem}
.step{display:flex;align-items:center;gap:.55rem;font-size:.72rem;font-weight:700;letter-spacing:.14em;color:var(--acc);margin:0}
.step b{font-variant-numeric:tabular-nums;background:var(--acc-soft);color:var(--acc);border-radius:100px;padding:.1rem .55rem;letter-spacing:.05em}
h2{font-size:clamp(1.5rem,6.5vw,1.95rem);font-weight:800;letter-spacing:-.035em;line-height:1.32;margin:0;text-wrap:balance}
h3{font-size:1.05rem;font-weight:700;letter-spacing:-.02em;margin:0}
p{margin:0}
section>p{color:var(--ink-mid)}
strong{font-weight:700;color:var(--ink)}
.pull{font-size:1.2rem;font-weight:700;line-height:1.55;letter-spacing:-.03em;color:var(--ink);
  border-left:3px solid var(--acc);padding-left:1rem;margin:.4rem 0;text-wrap:balance}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:1.25rem;
  box-shadow:var(--shadow);display:flex;flex-direction:column;gap:.8rem}
.note{background:var(--card-2);border-radius:12px;padding:1rem 1.1rem;font-size:.95rem;color:var(--ink-mid);border-left:3px solid var(--acc)}
.note.warm{background:var(--eosin-soft);border-left-color:var(--eosin)}
.note.cool{background:var(--acc-soft);border-left-color:var(--acc)}
.note.amber{background:var(--amber-soft);border-left-color:var(--amber)}
.note b{color:var(--ink)}
.caveat{position:relative;background:var(--amber-soft);border-radius:10px;padding:.8rem .95rem .8rem 2.5rem;
  font-size:.84rem;line-height:1.6;color:var(--ink-mid)}
.caveat::before{content:"!";position:absolute;left:.95rem;top:.95rem;display:grid;place-items:center;
  width:1.1rem;height:1.1rem;border-radius:50%;background:var(--amber);color:var(--ground);font-size:.72rem;font-weight:800;line-height:1}
.caveat b{color:var(--ink)}

.glance{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.gl{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:.95rem 1rem;display:flex;flex-direction:column;gap:.1rem}
.gl .v{font-size:1.45rem;font-weight:800;letter-spacing:-.04em;font-variant-numeric:tabular-nums;color:var(--acc);line-height:1.25}
.gl .l{font-size:.8rem;color:var(--ink-soft);line-height:1.45}
.gl.wide{grid-column:1/-1}

.path{display:flex;flex-direction:column;gap:.4rem}
.pth{display:grid;grid-template-columns:1.6rem 1fr;gap:.1rem .7rem;background:var(--card);
  border:1px solid var(--line);border-left:3px solid var(--acc);border-radius:10px;padding:.8rem 1rem}
.pth .n{grid-row:1/span 2;font-weight:800;color:var(--acc);font-variant-numeric:tabular-nums}
.pth b{font-size:.97rem}
.pth span:not(.n){font-size:.86rem;color:var(--ink-mid);line-height:1.6}

.risks{display:flex;flex-direction:column;gap:.4rem}
.risk{display:flex;align-items:flex-start;gap:.6rem;background:var(--card);border:1px solid var(--line);
  border-radius:10px;padding:.7rem .85rem;cursor:pointer;font-size:.9rem;line-height:1.5;color:var(--ink-mid)}
.risk input{margin-top:.3rem;accent-color:var(--acc);width:1rem;height:1rem;flex:none}
.risk .txt b{color:var(--ink);font-weight:700}
.risk .kind{font-size:.68rem;font-weight:800;letter-spacing:.06em;border-radius:99px;padding:.08rem .45rem;margin-left:.35rem;white-space:nowrap}
.risk .kind.mod{background:var(--acc-soft);color:var(--acc)}
.risk .kind.fix{background:var(--card-2);color:var(--ink-soft)}
.risk-out{background:var(--acc-soft);border-radius:10px;padding:.9rem 1rem;font-size:.9rem;color:var(--ink-mid);line-height:1.65}
.risk-out b{color:var(--ink)}

.symptoms{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.sym{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:.8rem .85rem;display:flex;flex-direction:column;gap:.2rem}
.sym b{font-size:.93rem}
.sym span{font-size:.8rem;color:var(--ink-soft);line-height:1.5}

.field{display:flex;flex-direction:column;gap:.4rem}
.field label{font-size:.85rem;font-weight:700;color:var(--ink)}
.seg{display:flex;gap:.4rem}
.seg button{flex:1;font-family:inherit;font-size:.9rem;font-weight:600;padding:.6rem;border-radius:10px;
  border:1px solid var(--line-firm);background:var(--card);color:var(--ink-mid);cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--acc);border-color:var(--acc);color:var(--on-acc)}
input[type=number]{font-family:inherit;font-size:1rem;padding:.65rem .8rem;border-radius:10px;
  border:1px solid var(--line-firm);background:var(--card);color:var(--ink);width:100%;font-variant-numeric:tabular-nums}
.elig{border-radius:10px;padding:.9rem 1rem;font-size:.92rem;line-height:1.6}
.elig.yes{background:var(--acc-soft);color:var(--ink-mid);border-left:3px solid var(--acc)}
.elig.not{background:var(--card-2);color:var(--ink-mid);border-left:3px solid var(--ink-soft)}
.elig b{color:var(--ink)}

.stages{display:flex;flex-direction:column;gap:.55rem}
.stg{display:grid;grid-template-columns:4.6rem 1fr 3.2rem;gap:.55rem;align-items:center;font-size:.85rem}
.stg .nm{font-weight:700;color:var(--ink)}
.stg .tr{background:var(--card-2);border-radius:99px;height:.7rem;overflow:hidden}
.stg .tr i{display:block;height:100%;border-radius:99px;background:var(--acc)}
.stg .pc{text-align:right;font-weight:800;font-variant-numeric:tabular-nums;color:var(--acc)}
.stg.low .tr i{background:var(--eosin)}
.stg.low .pc{color:var(--eosin)}
.stg .desc{grid-column:1/-1;font-size:.8rem;color:var(--ink-soft);margin-top:-.3rem}

.tx{display:flex;flex-direction:column;gap:.5rem}
.txc{background:var(--card);border:1px solid var(--line);border-top:3px solid var(--acc);border-radius:12px;
  padding:.95rem 1rem;display:flex;flex-direction:column;gap:.25rem}
.txc h3{color:var(--acc)}
.txc p{font-size:.89rem;color:var(--ink-mid)}
.txc .when{font-size:.78rem;font-weight:700;color:var(--ink-soft);letter-spacing:.03em}

.myths{display:flex;flex-direction:column;gap:.5rem}
.myth{width:100%;text-align:left;font-family:inherit;background:var(--eosin-soft);border:1px solid var(--eosin);
  border-radius:12px;padding:.9rem 1rem;cursor:pointer;display:flex;flex-direction:column;gap:.45rem;color:var(--ink)}
.myth .badge{align-self:flex-start;font-size:.68rem;font-weight:800;letter-spacing:.1em;
  background:var(--eosin);color:var(--ground);border-radius:100px;padding:.12rem .55rem}
.myth .claim{font-size:1rem;font-weight:700;line-height:1.5}
.myth .tap{font-size:.78rem;color:var(--eosin-ink);font-weight:700}
.myth .fact{display:none;font-size:.89rem;color:var(--ink-mid);line-height:1.65}
.myth[aria-expanded="true"]{background:var(--acc-soft);border-color:var(--acc)}
.myth[aria-expanded="true"] .badge{background:var(--acc);color:var(--on-acc)}
.myth[aria-expanded="true"] .claim{text-decoration:line-through;color:var(--ink-soft);font-weight:600}
.myth[aria-expanded="true"] .tap{display:none}
.myth[aria-expanded="true"] .fact{display:block}

.wrap-up{margin-top:3rem;background:var(--ink);color:var(--ground);border-radius:16px;padding:1.75rem 1.4rem;
  display:flex;flex-direction:column;gap:1.1rem}
.wrap-up h2{color:var(--ground);font-size:1.4rem}
.wrap-up ol{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:.85rem;counter-reset:w}
.wrap-up li{counter-increment:w;position:relative;padding-left:2.1rem;font-size:.95rem;line-height:1.65;
  color:color-mix(in srgb,var(--ground) 78%,transparent)}
.wrap-up li::before{content:counter(w,decimal-leading-zero);position:absolute;left:0;top:0;
  font-weight:800;font-variant-numeric:tabular-nums;color:var(--eosin)}
.wrap-up li b{color:var(--ground)}
.share{margin-top:1.25rem;width:100%;font-family:inherit;font-size:1rem;font-weight:700;padding:.95rem;
  border-radius:12px;border:0;background:var(--acc);color:var(--on-acc);cursor:pointer}
.share:active{transform:translateY(1px)}

footer{max-width:var(--w);margin:0 auto;padding:2.25rem var(--pad) 3.5rem;border-top:1px solid var(--line);
  display:flex;flex-direction:column;gap:.8rem;font-size:.8rem;color:var(--ink-soft);line-height:1.7}
footer h4{margin:0;font-size:.72rem;letter-spacing:.16em;color:var(--ink-mid)}
footer ul{margin:0;padding-left:1.1rem;display:flex;flex-direction:column;gap:.3rem}
footer .disclaim{background:var(--card-2);border-radius:10px;padding:.85rem 1rem;color:var(--ink-mid);font-weight:600}
footer a{color:var(--acc)}
:focus-visible{outline:2px solid var(--eosin);outline-offset:2px}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
</style>
</head>
<body>

<div id="progress"></div>

<header class="hero">
  <canvas id="field" aria-hidden="true"></canvas>
  <div class="hero-veil"></div>
  <div class="hero-inner">
    <h1>${m.title}</h1>
    <p>${m.heroLine}</p>
    <p class="meta">정독 약 ${m.minutes}분 · 2023년 국가암등록통계 기준</p>
    <div class="scroll-cue" aria-hidden="true">
      <svg viewBox="0 0 24 28" width="24" height="28" fill="none" stroke="currentColor"
           stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 9l7 7 7-7" />
        <path d="M5 17l7 7 7-7" opacity=".45" />
      </svg>
    </div>
  </div>
</header>

<main>

  <section id="s2">
    <p class="caveat" style="margin-top:2.25rem">먼저 짚고 갑니다. 이 글은 <b>${plain.split(',')[0]}을 이해하는 데 쓰라고 만든 것</b>이지 <b>진료를 대신하라고 만든 것이 아닙니다.</b> 지금 몸에 걸리는 데가 있다면 검진 시기를 따지지 말고 병원부터 가시는 게 맞습니다.</p>
    <p class="step"><b>02</b> 한눈에 보기</p>
    <h2>숫자로 먼저</h2>
    <div class="glance">
${glance}
    </div>
    <p class="caveat">생존율은 <b>과거에 진단받은 환자 집단의 통계</b>이며 개인의 예후를 예측하는 숫자가 아닙니다. 같은 암이라도 발견된 병기, 나이, 건강 상태에 따라 결과는 크게 달라집니다.</p>
  </section>

  <section id="s3">
    <p class="step"><b>03</b> 장기</p>
    <h2>${m.organTitle}</h2>
    <p>${m.organLead}</p>
    <div class="note">${m.organNote}</div>
  </section>

  <section id="s4">
    <p class="step"><b>04</b> 정의</p>
    <h2>${m.defineTitle}</h2>
    <div class="path">
${path}
    </div>
    ${m.pathNote ? `<div class="note cool">${m.pathNote}</div>` : ''}
  </section>

  <section id="s5">
    <p class="step"><b>05</b> 현황</p>
    <h2>${m.trendTitle}</h2>
    <p>${m.trendBody}</p>
    ${m.trendNote ? `<div class="note amber">${m.trendNote}</div>` : ''}
  </section>

  <section id="s6">
    <p class="step"><b>06</b> 위험요인</p>
    <h2>누가 잘 걸리나</h2>
    <p>해당하는 항목을 눌러 보세요. <strong>바꿀 수 있는 것과 그렇지 않은 것</strong>을 구분해 보여 드립니다.</p>
    <div class="card">
      <div class="risks" id="risks">
${risks}
      </div>
      <div class="risk-out" id="riskOut" role="status" aria-live="polite"></div>
    </div>
  </section>

  <section id="s7">
    <p class="step"><b>07</b> 증상</p>
    <h2>어떤 신호가 나타나나</h2>
    <div class="note warm">${m.symptomsLead}</div>
    <div class="symptoms">
${symptoms}
    </div>
    <div class="note">이 신호들은 <b>훨씬 흔한 다른 병에서도 똑같이 나타납니다.</b> 증상만으로는 구분되지 않고, 흔한 병이라 여겨 넘기기도 쉽습니다. 몇 주 이상 이어진다면 나이와 관계없이 진료를 받으시는 편이 낫습니다.</div>
  </section>

  <section id="s8">
    <p class="step"><b>08</b> 예방</p>
    <h2>예방할 수 있나</h2>
    <p>${m.preventLead}</p>
    <div class="symptoms">
${prevent}
    </div>
    ${m.preventNote ? `<div class="note amber">${m.preventNote}</div>` : ''}
  </section>
${screeningSection}

  <section id="s10">
    <p class="step"><b>10</b> 진단</p>
    <h2>어떻게 진단하나</h2>
    <p>검진이나 영상에서 이상이 나왔다고 곧 암은 아닙니다. 확진까지는 단계가 있습니다.</p>
    <div class="path">
${diagnose}
    </div>
    ${m.diagnoseNote ? `<div class="note">${m.diagnoseNote}</div>` : ''}
  </section>

  <section id="s11">
    <p class="step"><b>11</b> 병기</p>
    <h2>병기와 예후</h2>
    <p>병기는 <strong>얼마나 깊이 파고들었고 어디까지 번졌는지</strong>를 정리한 것입니다.</p>
    <div class="card">
      <div class="stages">
${stages}
      </div>
      <p class="caveat" style="margin:0">${m.stagesNote}</p>
    </div>
  </section>

  <section id="s12">
    <p class="step"><b>12</b> 치료</p>
    <h2>어떻게 치료하나</h2>
    <p>병기와 상태에 따라 조합이 달라집니다. 아래는 어떤 선택지가 있는지 개관한 것입니다.</p>
    <div class="tx">
${treat}
    </div>
    ${m.treatNote ? `<div class="note">${m.treatNote}</div>` : ''}
  </section>

  <section id="s13">
    <p class="step"><b>13</b> 정리</p>
    <h2>흔한 오해 세 가지</h2>
    <p>여기까지 읽으셨다면 아래 세 문장이 왜 어긋났는지 설명하실 수 있습니다. 눌러서 확인해 보세요.</p>
    <div class="myths">
${myths}
    </div>
  </section>

  <div class="wrap-up">
    <h2>오늘 정리</h2>
    <ol>
${summary}
    </ol>
    <button class="share" id="shareBtn">이 자료 공유하기</button>
  </div>

</main>

<footer>
  <h4>참고 자료</h4>
  <ul>
${sources}
  </ul>
  <p>수치에는 모두 기준연도를 붙였습니다. 통계는 해마다 갱신되므로 시간이 지나면 숫자가 달라집니다. 최신 값은 국가암정보센터에서 확인하실 수 있습니다.</p>
  <p class="disclaim">여기까지 읽으셨다면 ${plain.split(',')[0]}이 어떤 병인지는 대략 잡히셨을 겁니다. 다만 이 글이 진료를 대신할 수는 없습니다. 몸에 걸리는 데가 있거나 검진 결과가 마음에 걸린다면, 이 글을 다시 읽는 것보다 의료진과 이야기하시는 편이 훨씬 정확합니다.</p>
  <p><a href="cancer.html">← 다른 암 자료 보기</a></p>
</footer>

<script>
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var bar = document.getElementById('progress');
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = Math.min(100, Math.max(0, h > 0 ? (window.scrollY / h) * 100 : 0)) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* 표지 배경 — 세포 무리 */
  var cv = document.getElementById('field');
  var ctx = cv.getContext('2d');
  var cells = [], t = 0;
  function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function seed() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = cv.getBoundingClientRect();
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cells = [];
    var n = Math.max(16, Math.min(48, Math.round(r.width * r.height / 9000)));
    for (var i = 0; i < n; i++) {
      cells.push({ x: Math.random() * r.width, y: Math.random() * r.height,
        r: 7 + Math.random() * 12, vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12,
        bad: i > n * 0.76 });
    }
    return r;
  }
  function draw() {
    var r = cv.getBoundingClientRect();
    var a = css('--acc') || '#444', bad = css('--eosin') || '#D0356A';
    ctx.clearRect(0, 0, r.width, r.height);
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      c.x += c.vx; c.y += c.vy;
      if (c.x < -20) c.x = r.width + 20; if (c.x > r.width + 20) c.x = -20;
      if (c.y < -20) c.y = r.height + 20; if (c.y > r.height + 20) c.y = -20;
      var col = c.bad ? bad : a;
      ctx.globalAlpha = c.bad ? .26 : .14; ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = c.bad ? .55 : .3; ctx.lineWidth = 1.1; ctx.strokeStyle = col; ctx.stroke();
      ctx.globalAlpha = c.bad ? .8 : .45;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r * .34, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function loop() { t++; draw(); requestAnimationFrame(loop); }
  seed();
  if (reduce) draw(); else loop();
  window.addEventListener('resize', function () { seed(); if (reduce) draw(); });

  /* 위험요인 */
  var riskBox = document.getElementById('risks');
  var riskOut = document.getElementById('riskOut');
  function renderRisk() {
    var mod = 0, fix = 0;
    riskBox.querySelectorAll('input').forEach(function (b) {
      if (!b.checked) return;
      b.dataset.kind === 'mod' ? mod++ : fix++;
    });
    riskOut.innerHTML = '';
    if (mod + fix === 0) {
      riskOut.textContent = '해당하는 항목을 눌러 보세요. 몇 개인지 세는 것이 목적이 아니라, 어느 쪽에 손을 댈 수 있는지 보시는 게 목적입니다.';
      return;
    }
    var s = document.createElement('span');
    if (mod === 0) {
      s.innerHTML = '고른 항목이 모두 <b>바꾸기 어려운 쪽</b>입니다. 이런 경우일수록 <b>검진 주기를 지키는 것</b>이 실질적인 대응이 됩니다.';
    } else {
      s.innerHTML = '고르신 것 중 <b>' + mod + '개는 조절할 수 있는 항목</b>입니다' +
        (fix ? ', 나머지 ' + fix + '개는 바꾸기 어려운 쪽이고요' : '') +
        '. 바꿀 수 있는 쪽을 줄이고 검진 주기를 지키는 것, 지금 하실 수 있는 일은 이 두 가지입니다.';
    }
    riskOut.appendChild(s);
    var note = document.createElement('span');
    note.style.cssText = 'display:block;margin-top:.5rem;font-size:.83rem;color:var(--ink-soft)';
    note.textContent = '이 결과는 위험도를 계산한 것이 아니며 진단이나 예측이 아닙니다.';
    riskOut.appendChild(note);
  }
  riskBox.addEventListener('change', renderRisk);
  renderRisk();
${eligScript}
  /* 오해 뒤집기 */
  document.querySelectorAll('.myth').forEach(function (m) {
    m.addEventListener('click', function () {
      var open = m.getAttribute('aria-expanded') === 'true';
      m.setAttribute('aria-expanded', String(!open));
      m.querySelector('.badge').textContent = open ? '오해' : '사실';
    });
  });

  /* 공유 */
  document.getElementById('shareBtn').addEventListener('click', async function () {
    var text = ${JSON.stringify(plain)};
    var url = location.href;
    try {
      if (navigator.share) { await navigator.share({ title: text, text: text, url: url }); return; }
      await navigator.clipboard.writeText(text + '\\n' + url);
      this.textContent = '링크를 복사했습니다';
      var self = this;
      setTimeout(function () { self.textContent = '이 자료 공유하기'; }, 2000);
    } catch (_) {}
  });
})();
</script>
</body>
</html>
`;
}

/* ─────────────────────────────────────────────────────────────
   실행
   ───────────────────────────────────────────────────────────── */
for (const m of MODULES) {
  const out = join(root, `cancer-${m.slug}.html`);
  writeFileSync(out, render(m));
  console.log(`생성  cancer-${m.slug}.html  (${tone(m.group).name} · ${m.group})`);
}
console.log(`\n총 ${MODULES.length}개 모듈`);

export { MODULES, tone };
