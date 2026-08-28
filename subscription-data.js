// 구독료 다이어트 — 서비스 목록.
// 클래식 스크립트로 쓴다(export 금지). 브라우저에서는 전역 SUBSCRIPTION_SERVICES로,
// Node 테스트에서는 require로 쓴다.
//
// price 규칙: 값이 확실한 것만 숫자로 넣고, 아니면 null로 비워 둔다.
//   틀린 금액은 이 앱의 유일한 무기인 "연간 총액"의 신뢰를 무너뜨린다.
//   null이면 사용자가 체크할 때 앱이 금액을 물어본다.
// hint: 요금제가 여러 개거나 다른 구독에 포함되는 경우를 알려준다. 없으면 null.
//   예: 쿠팡플레이는 쿠팡 와우에 포함이라 둘 다 세면 총액이 부풀어 오른다.
// includedIn: 이 서비스가 포함되어 있는 "상위" 서비스의 id. 포함 관계가 없으면 null.
//   hint 문자열을 파싱하지 않고, 이 필드로 "둘 다 선택됨"을 코드에서 직접 판단한다.
// 기준 시점: 2026년 8월. 가격이 바뀌면 이 파일만 고치면 된다.
var SUBSCRIPTION_SERVICES = [
  // hint: 금액 패널에 함께 보여줄 한 줄 안내. 없으면 null.
  { id: 'netflix',    name: '넷플릭스',        category: '영상',      price: 13500, hint: '스탠다드 기준이에요. 광고형 7,000원 · 프리미엄 17,000원', includedIn: null },
  { id: 'disney',     name: '디즈니+',         category: '영상',      price: 9900,  hint: '스탠다드 기준이에요. 프리미엄 13,900원', includedIn: null },
  { id: 'tving',      name: '티빙',            category: '영상',      price: 13500, hint: '스탠다드 기준이에요. 베이직 9,500원 · 프리미엄 17,000원', includedIn: null },
  { id: 'wavve',      name: '웨이브',          category: '영상',      price: 10900, hint: '스탠다드 기준이에요. 베이직 7,900원 · 프리미엄 13,900원', includedIn: null },
  { id: 'coupangplay',name: '쿠팡플레이',      category: '영상',      price: 0,     hint: '쿠팡 와우를 쓰시면 이미 포함돼 있어요. 광고 없는 프리미엄 패스는 3,900원 추가예요', includedIn: 'coupang' },
  { id: 'appletv',    name: '애플TV+',         category: '영상',      price: 6500,  hint: '애플 원을 쓰시면 이미 포함돼 있어요', includedIn: 'appleone' },
  { id: 'watcha',     name: '왓챠',            category: '영상',      price: 7900,  hint: '베이직 기준이에요. 상위 요금제 12,900원', includedIn: null },
  { id: 'laftel',     name: '라프텔',          category: '영상',      price: 9900,  hint: '기본 기준이에요. 상위 요금제 14,900원', includedIn: null },
  { id: 'ytpremium',  name: '유튜브 프리미엄',  category: '영상',      price: 14900, hint: 'Premium 기준이에요. Lite는 8,500원. 유튜브 뮤직이 이미 포함돼 있어요', includedIn: null },
  { id: 'appleone',   name: '애플 원',         category: '영상',      price: 14900, hint: '개인 기준이에요. 가족 20,900원. 애플TV+·애플뮤직·아이클라우드가 포함돼요', includedIn: null },

  { id: 'ytmusic',    name: '유튜브 뮤직',      category: '음악',      price: null,  hint: '유튜브 프리미엄을 쓰시면 이미 포함돼 있어요', includedIn: 'ytpremium' },
  { id: 'spotify',    name: '스포티파이',       category: '음악',      price: null,  hint: null, includedIn: null },
  { id: 'applemusic', name: '애플 뮤직',       category: '음악',      price: null,  hint: '애플 원을 쓰시면 이미 포함돼 있어요', includedIn: 'appleone' },
  { id: 'melon',      name: '멜론',            category: '음악',      price: null,  hint: null, includedIn: null },
  { id: 'flo',        name: '플로',            category: '음악',      price: null,  hint: null, includedIn: null },
  { id: 'genie',      name: '지니뮤직',        category: '음악',      price: null,  hint: null, includedIn: null },
  { id: 'bugs',       name: '벅스',            category: '음악',      price: null,  hint: null, includedIn: null },

  { id: 'millie',     name: '밀리의 서재',      category: '전자책',    price: null,  hint: null, includedIn: null },
  { id: 'ridi',       name: '리디셀렉트',       category: '전자책',    price: null,  hint: null, includedIn: null },
  { id: 'crema',      name: '크레마클럽',       category: '전자책',    price: null,  hint: null, includedIn: null },

  { id: 'naverplus',  name: '네이버플러스',     category: '쇼핑·배송', price: null,  hint: '네이버 MYBOX 용량이 함께 나와요', includedIn: null },
  { id: 'coupang',    name: '쿠팡 와우',        category: '쇼핑·배송', price: 7890,  hint: '쿠팡플레이가 포함돼 있어요', includedIn: null },
  { id: 'baemin',     name: '배민클럽',        category: '쇼핑·배송', price: null,  hint: null, includedIn: null },
  { id: 'kurly',      name: '컬리멤버스',       category: '쇼핑·배송', price: null,  hint: null, includedIn: null },

  { id: 'icloud',     name: '아이클라우드',     category: '클라우드',  price: null,  hint: '애플 원을 쓰시면 이미 포함돼 있어요', includedIn: 'appleone' },
  { id: 'googleone',  name: '구글 원',         category: '클라우드',  price: null,  hint: null, includedIn: null },
  { id: 'naverbox',   name: '네이버 MYBOX',    category: '클라우드',  price: null,  hint: '네이버플러스를 쓰시면 기본 용량이 포함돼 있어요', includedIn: 'naverplus' },
  { id: 'ms365',      name: 'MS365',           category: '클라우드',  price: null,  hint: '오피스와 원드라이브가 함께 나와요', includedIn: null },

  { id: 'chatgpt',    name: '챗GPT',           category: 'AI·업무',   price: null,  hint: null, includedIn: null },
  { id: 'claude',     name: '클로드',          category: 'AI·업무',   price: null,  hint: null, includedIn: null },
  { id: 'gemini',     name: '제미나이',        category: 'AI·업무',   price: null,  hint: null, includedIn: null },
  { id: 'perplexity', name: '퍼플렉시티',      category: 'AI·업무',   price: null,  hint: null, includedIn: null },
  { id: 'canva',      name: '캔바',            category: 'AI·업무',   price: null,  hint: null, includedIn: null },
  { id: 'notion',     name: '노션',            category: 'AI·업무',   price: null,  hint: null, includedIn: null },
  { id: 'adobe',      name: '어도비',          category: 'AI·업무',   price: null,  hint: null, includedIn: null },

  { id: 'psplus',     name: '플스 플러스',      category: '게임',      price: null,  hint: null, includedIn: null },
  { id: 'xboxpass',   name: '엑스박스 게임패스', category: '게임',      price: null,  hint: null, includedIn: null },
  { id: 'nintendo',   name: '닌텐도 온라인',    category: '게임',      price: null,  hint: null, includedIn: null },

  { id: 'strava',     name: '스트라바',        category: '운동·건강', price: null,  hint: null, includedIn: null },
  { id: 'calm',       name: '캄',              category: '운동·건강', price: null,  hint: null, includedIn: null },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SUBSCRIPTION_SERVICES;
}
