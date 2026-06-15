/* ================================================================
   동네 장날 — 우리 동네 전통시장 길잡이 (MVP)
   ----------------------------------------------------------------
   ✏️ 우리 동네 시장으로 바꾸려면 아래 MARKETS 배열만 수정하세요.
   - type: "5일장" 이면 ohDigits에 장 서는 "날짜 끝자리"를 적어요.
       예) 4·9일장 → ohDigits: [4, 9]   /  5·10일장 → [5, 0]
     "상설" 이면 매일 영업(ohDigits 불필요).
   - lat/lng: 길찾기·지도 버튼에 쓰여요(카카오맵). 모르면 비워도 됩니다.
   ================================================================ */

const MARKETS = [
  {
    id: "moran",
    name: "모란민속 5일장",
    region: "경기 성남시 중원구 (모란역 인근)",
    type: "5일장",
    ohDigits: [4, 9],          // 끝자리 4, 9일에 장이 섭니다 (4·9일장)
    hours: "보통 08:00 ~ 17:00 (장날)",
    intro: "전국에서 손꼽히는 큰 5일장. 농수산물부터 약초·묘목·만물까지 없는 게 없어요.",
    specialties: ["잡곡·약초", "묘목·화초", "건어물", "장터 먹거리"],
    foods: [
      { name: "옛날 손칼국수·잔치국수", desc: "장터 한 바퀴 돌고 든든하게. 가격도 착해요." },
      { name: "순대·순대국밥", desc: "갓 삶은 순대에 국밥 한 그릇이면 속이 든든." },
      { name: "제철 나물·말린 나물", desc: "곤드레·취나물 등은 데쳐서 무침·밥에 활용하기 좋아요." },
    ],
    shops: [
      { name: "약초·잡곡 골목", desc: "건강원·약재 가게가 모여 있어 비교하며 고르기 좋아요." },
      { name: "묘목·화초 코너", desc: "봄철엔 모종·묘목, 철마다 화초가 다양하게 나와요." },
    ],
    transport: {
      bus: [
        { no: "예시 51", info: "모란역 정류장 하차 (배차·시간은 확인 필요)" },
        { no: "예시 200", info: "모란시장 입구 인근 정차" },
      ],
      subway: "수도권 지하철 8호선·분당선 모란역에서 도보 약 5분",
      note: "장날(끝자리 4·9일)엔 매우 붐벼요. 대중교통 권장!",
    },
    lat: 37.4329, lng: 127.1295,
  },
  {
    id: "gwangjang",
    name: "광장시장",
    region: "서울 종로구 (종로5가 인근)",
    type: "상설",
    hours: "상점마다 다름 / 먹자골목 보통 09:00 ~ 23:00",
    intro: "100년 넘은 서울 대표 상설시장. 먹거리·구제·한복·이불까지, 특히 먹자골목이 명물이에요.",
    specialties: ["빈대떡", "마약김밥", "육회", "생선·모둠전"],
    foods: [
      { name: "녹두 빈대떡", desc: "바삭하게 부친 빈대떡은 막걸리와 찰떡. 시장의 시그니처." },
      { name: "마약김밥", desc: "겨자장에 콕 찍어 먹는 작은 김밥. 간식으로 딱." },
      { name: "육회·육사시미", desc: "신선한 육회 한 접시. 비빔으로도 즐겨요." },
    ],
    shops: [
      { name: "먹자골목", desc: "빈대떡·김밥·전집이 줄지어 있어요. 줄 짧은 곳부터 도전!" },
      { name: "구제·수입 골목", desc: "빈티지 옷·원단을 저렴하게. 발품 팔수록 보물 발견." },
    ],
    transport: {
      bus: [
        { no: "예시 101", info: "종로5가 정류장 하차 후 도보 2분 (확인 필요)" },
      ],
      subway: "지하철 1호선 종로5가역, 2·5호선 을지로4가역에서 도보 5분 내외",
      note: "주말엔 먹자골목이 많이 붐벼요. 평일 낮이 한산해요.",
    },
    lat: 37.5701, lng: 127.0006,
  },

  // ===== 전국 구석구석 시골 미니 5일장 =====
  {
    id: "jeongseon",
    name: "정선아리랑시장",
    region: "강원 정선군 정선읍 (시골 5일장)",
    type: "5일장",
    ohDigits: [2, 7],          // 2·7일장
    hours: "보통 08:00 ~ 17:00 (장날)",
    intro: "산골 정취 가득한 강원도 대표 5일장. 약초와 산나물, 토속 먹거리가 일품이에요.",
    specialties: ["곤드레·산나물", "황기·약초", "수리취떡", "메밀"],
    foods: [
      { name: "곤드레밥", desc: "곤드레나물을 넣어 지은 밥에 양념장 슥슥. 정선의 맛." },
      { name: "콧등치기국수", desc: "메밀국수를 후루룩 먹다 콧등을 친다고 붙은 이름. 별미!" },
      { name: "수리취떡·메밀전병", desc: "장터 간식으로 딱. 따끈할 때가 제일 맛있어요." },
    ],
    shops: [
      { name: "약초·산나물 골목", desc: "황기·곤드레 등 산에서 난 것들을 직접 보고 살 수 있어요." },
    ],
    transport: {
      bus: [{ no: "정선 시내버스", info: "정선시장 정류장 인근 (시간 확인 필요)" }],
      subway: "정선아리랑열차(A-train)로 정선역 → 시장까지 버스/택시",
      note: "관광열차 타고 장날 맞춰 가면 여행 코스로 딱이에요.",
    },
    lat: 37.3805, lng: 128.6608,
  },
  {
    id: "bongpyeong",
    name: "봉평장 (봉평 5일장)",
    region: "강원 평창군 봉평면 (시골 5일장)",
    type: "5일장",
    ohDigits: [2, 7],          // 2·7일장
    hours: "보통 09:00 ~ 17:00 (장날)",
    intro: "「메밀꽃 필 무렵」의 그 봉평. 메밀로 시작해 메밀로 끝나는 정겨운 시골장이에요.",
    specialties: ["메밀(막국수·전병)", "감자", "산나물", "토종꿀"],
    foods: [
      { name: "메밀막국수", desc: "봉평 메밀로 뽑은 면. 시원하게 한 그릇이면 더위가 싹." },
      { name: "메밀전병·메밀부침", desc: "속이 꽉 찬 전병은 장터 대표 간식이에요." },
    ],
    shops: [
      { name: "메밀 먹거리 골목", desc: "막국수·전병집이 모여 있어요. 효석문화마을도 가까워요." },
    ],
    transport: {
      bus: [{ no: "평창 시내버스", info: "봉평시장 인근 하차 (시간 확인 필요)" }],
      subway: "기차편 없음 — 시외버스(장평/봉평) 또는 자가용 이용",
      note: "9월 효석문화제 즈음 메밀꽃밭과 함께 보면 좋아요.",
    },
    lat: 37.5639, lng: 128.3331,
  },
  {
    id: "hwagae",
    name: "화개장터",
    region: "경남 하동군 화개면 (옛 5일장·상설)",
    type: "상설",
    hours: "보통 09:00 ~ 18:00 (상점마다 다름)",
    intro: "지리산과 섬진강이 만나는 곳. 영호남 사람들이 모이던 정겨운 장터예요.",
    specialties: ["하동 녹차", "산나물·고사리", "섬진강 재첩", "약초"],
    foods: [
      { name: "재첩국·재첩비빔밥", desc: "섬진강 재첩으로 끓인 시원한 국. 해장으로 그만이에요." },
      { name: "산나물 비빔밥", desc: "지리산 나물 듬뿍. 봄이면 종류가 더 다양해요." },
    ],
    shops: [
      { name: "약초·산나물 전", desc: "말린 나물·약초가 가득. 향부터 다릅니다." },
      { name: "하동 녹차 가게", desc: "햇차 철엔 갓 덖은 녹차를 맛볼 수 있어요." },
    ],
    transport: {
      bus: [{ no: "하동 농어촌버스", info: "화개장터 정류장 하차 (시간 확인 필요)" }],
      subway: "기차편 없음 — 하동/구례 시외버스 또는 자가용",
      note: "벚꽃철(4월) 화개십리벚꽃길과 함께 가면 환상적이에요.",
    },
    lat: 35.1721, lng: 127.6258,
  },
  {
    id: "punggi",
    name: "풍기인삼시장",
    region: "경북 영주시 풍기읍 (상설)",
    type: "상설",
    hours: "보통 09:00 ~ 19:00 (상점마다 다름)",
    intro: "예부터 인삼으로 이름난 풍기. 인삼과 영주 사과를 한자리에서 만나요.",
    specialties: ["풍기인삼", "영주 사과", "인삼 가공품", "약초"],
    foods: [
      { name: "인삼튀김", desc: "수삼을 바삭하게 튀겨낸 별미. 장터 간식으로 인기예요." },
      { name: "인삼갈비탕·삼계", desc: "인삼 넣어 푹 끓인 보양식. 기운 없을 때 좋아요." },
    ],
    shops: [
      { name: "인삼 상가 거리", desc: "수삼·홍삼·가공품을 비교하며 고르기 좋아요." },
    ],
    transport: {
      bus: [{ no: "영주 시내버스", info: "풍기시장 인근 하차 (시간 확인 필요)" }],
      subway: "중앙선 풍기역에서 가까워요(도보·택시).",
      note: "가을 영주 사과철엔 사과도 꼭 챙겨보세요.",
    },
    lat: 36.8703, lng: 128.5236,
  },

  // ===== 울산·부산·양산 — 영남권 시장 & 미니 5일장 =====
  {
    id: "eonyang",
    name: "언양알프스시장",
    region: "울산 울주군 언양읍 (영남알프스 관문)",
    type: "5일장",
    ohDigits: [2, 7],          // 2·7일장 (1915년부터 이어진 전통)
    hours: "보통 08:00 ~ 18:00 (장날), 상가는 평일도 영업",
    intro: "영남알프스 자락의 울산 대표 5일장. 언양미나리·언양불고기로 유명하고, 장날엔 산나물·약초가 가득해요.",
    specialties: ["언양미나리", "언양불고기", "산나물·약초", "장터 먹거리"],
    foods: [
      { name: "언양불고기", desc: "석쇠에 구운 얇은 양념불고기. 미나리 곁들이면 별미예요." },
      { name: "미나리전·미나리무침", desc: "봄철 언양미나리는 향이 진해요. 전·무침·삼겹 곁들이로 인기." },
      { name: "장터국밥·잔치국수", desc: "장 한 바퀴 돌고 든든하게 한 그릇." },
    ],
    shops: [
      { name: "미나리·산나물 골목", desc: "제철 미나리와 곤드레·취나물 등을 직접 보고 살 수 있어요." },
      { name: "불고기 거리", desc: "언양불고기 식당·정육점이 모여 있어 사서 바로 구워 먹기 좋아요." },
    ],
    transport: {
      bus: [
        { no: "울산 시내버스(언양 방면)", info: "언양시외버스터미널·언양시장 인근 하차 (노선·배차 확인 필요)" },
      ],
      subway: "도시철도 없음 — KTX 울산역에서 버스/택시로 약 10분",
      note: "장날(끝자리 2·7)엔 붐벼요. 영남알프스 등산과 묶으면 코스로 좋아요.",
    },
  },
  {
    id: "namchang",
    name: "남창옹기종기시장",
    region: "울산 울주군 온양읍 남창 (시골 5일장)",
    type: "5일장",
    ohDigits: [3, 8],          // 3·8일장
    hours: "보통 08:00 ~ 17:00 (장날)",
    intro: "외고산 옹기마을 가까운 정겨운 시골 5일장. 옹기와 갯것(해산물)·농산물이 함께 나와요.",
    specialties: ["옹기·항아리", "온산 갯것(해산물)", "제철 농산물", "장터 먹거리"],
    foods: [
      { name: "장터국밥·국수", desc: "장날 따끈하게 말아주는 국밥·국수가 인기예요." },
      { name: "갓 잡은 해산물", desc: "인근 온산·서생 바다에서 온 생선·조개를 저렴하게." },
    ],
    shops: [
      { name: "옹기 코너", desc: "외고산 옹기마을에서 온 항아리·옹기를 만날 수 있어요." },
      { name: "농수산물 난전", desc: "철마다 나는 채소·나물·해산물이 가득해요." },
    ],
    transport: {
      bus: [{ no: "울산 시내버스(남창 방면)", info: "남창시장·남창역 인근 하차 (시간 확인 필요)" }],
      subway: "동해선 남창역에서 도보 약 5분",
      note: "동해선 전철로 닿기 편해요. 옹기마을과 함께 둘러보기 좋아요.",
    },
  },
  {
    id: "gupo",
    name: "구포시장",
    region: "부산 북구 구포동 (상설 + 3·8 5일장)",
    type: "5일장",
    ohDigits: [3, 8],          // 상설이지만 끝자리 3·8일엔 장이 두 배로 커져요
    hours: "상설 매일 영업 / 장날(3·8)엔 난전이 크게 서요",
    intro: "1930년대부터 이어진 부산 최대급 전통시장. 평소엔 상설, 끝자리 3·8일 장날엔 규모가 두 배가 돼요. 구포국수가 명물.",
    specialties: ["구포국수", "농수산물", "건어물", "장터 먹거리"],
    foods: [
      { name: "구포국수", desc: "구포의 대표 명물. 잔치국수 한 그릇으로 시장 투어 시작!" },
      { name: "팥죽·단팥", desc: "겨울철 따끈한 팥죽이 인기예요." },
      { name: "어묵·튀김", desc: "부산답게 어묵·튀김 간식거리가 풍성해요." },
    ],
    shops: [
      { name: "국수 도매 골목", desc: "구포국수 공장·도매점이 모여 있어 선물용으로 사기 좋아요." },
      { name: "농수산 난전", desc: "장날엔 길을 따라 난전이 끝없이 이어져요." },
    ],
    transport: {
      bus: [{ no: "부산 시내버스(구포시장 정류장)", info: "구포시장 앞 하차 (노선 다수, 확인 필요)" }],
      subway: "부산도시철도 3호선 구포역, 경부선 구포역에서 도보 5분 내외",
      note: "장날(3·8)은 매우 붐벼요. 지하철·기차로 가는 걸 권해요.",
    },
  },
  {
    id: "gijang",
    name: "기장시장",
    region: "부산 기장군 기장읍 (상설·해산물)",
    type: "상설",
    hours: "보통 08:00 ~ 20:00 (상점마다 다름)",
    intro: "동남부 해안 최고의 해산물 시장. 기장 멸치·미역·대게로 이름났고, 겨울엔 대게·곰장어가 인기예요.",
    specialties: ["기장 멸치", "기장 미역·다시마", "대게", "곰장어"],
    foods: [
      { name: "대게·홍게", desc: "제철엔 싱싱한 대게를 골라 쪄 먹을 수 있어요." },
      { name: "짚불 곰장어", desc: "기장 명물. 짚불에 구운 곰장어는 고소하고 쫄깃해요." },
      { name: "멸치회·멸치쌈밥", desc: "봄 기장 멸치철엔 회·쌈밥이 별미예요." },
    ],
    shops: [
      { name: "건어물·미역 가게", desc: "기장 미역·다시마·멸치를 선물용으로 사기 좋아요." },
      { name: "활어·대게 코너", desc: "수족관에서 직접 고르면 즉석에서 손질해 줘요." },
    ],
    transport: {
      bus: [{ no: "부산 시내버스(기장시장 방면)", info: "기장시장·기장역 인근 하차 (시간 확인 필요)" }],
      subway: "동해선 기장역에서 도보 약 7분",
      note: "동해선 전철로 닿기 편해요. 주말엔 해산물 사러 온 사람들로 붐벼요.",
    },
  },
  {
    id: "jagalchi",
    name: "자갈치시장",
    region: "부산 중구 남포동 (상설·수산)",
    type: "상설",
    hours: "보통 05:00 ~ 22:00 (상점마다 다름)",
    intro: "\"오이소·보이소·사이소\"의 부산 대표 수산시장. 갓 잡은 활어와 회, 곰장어가 명물이에요.",
    specialties: ["활어회", "곰장어", "건어물", "제철 생선"],
    foods: [
      { name: "활어회", desc: "2층에서 즉석으로 떠주는 싱싱한 회 한 접시." },
      { name: "곰장어구이", desc: "자갈치 명물. 양념·소금구이로 즐겨요." },
      { name: "고래고기·꼼장어", desc: "부산 특유의 먹거리도 맛볼 수 있어요." },
    ],
    shops: [
      { name: "활어 좌판", desc: "직접 고르면 회로 떠주고 2층 식당에서 먹을 수 있어요." },
      { name: "건어물 거리", desc: "마른오징어·멸치 등 선물용 건어물이 가득해요." },
    ],
    transport: {
      bus: [{ no: "부산 시내버스(자갈치·남포동)", info: "자갈치시장 인근 하차 (노선 다수)" }],
      subway: "부산도시철도 1호선 자갈치역 10번 출구에서 도보 5분",
      note: "10월 자갈치축제 때 가면 더 활기차요. 새벽 경매도 볼만해요.",
    },
  },
  {
    id: "yangsan-nambu",
    name: "양산남부시장",
    region: "경남 양산시 중부동 (상설 + 1·6 5일장)",
    type: "5일장",
    ohDigits: [1, 6],          // 상설이지만 끝자리 1·6일엔 5일장이 크게 서요
    hours: "상설 매일 영업 / 장날(1·6)엔 난전이 크게 서요",
    intro: "양산 도심의 대표 시장. 평소엔 상설, 끝자리 1·6일 장날엔 인근에서 모인 농산물 난전이 크게 열려요.",
    specialties: ["제철 농산물", "산나물·약초", "분식·먹거리", "생활잡화"],
    foods: [
      { name: "장터 국수·팥죽", desc: "장날 따끈하게 한 그릇 하기 좋아요." },
      { name: "분식·튀김", desc: "떡볶이·튀김·호떡 등 먹거리가 풍성해요." },
      { name: "제철 나물·반찬", desc: "철마다 나는 나물로 반찬거리 장보기 좋아요." },
    ],
    shops: [
      { name: "농산물 난전", desc: "장날엔 인근 농가에서 직접 들고 나온 채소·나물이 가득." },
      { name: "먹자골목", desc: "분식·국수집이 모여 있어 장보고 한 끼 해결하기 좋아요." },
    ],
    transport: {
      bus: [{ no: "양산 시내버스(남부시장 방면)", info: "남부시장 인근 하차 (시간 확인 필요)" }],
      subway: "부산도시철도 양산선·2호선 인근 — 양산역에서 버스/택시로 이동",
      note: "장날(끝자리 1·6)엔 더 붐벼요. 도심이라 대중교통이 편해요.",
    },
  },

  // ===== 울산 구·동네별 시장 (중구·남구·동구·북구) =====
  {
    id: "ulsan-jungang",
    name: "울산중앙전통시장",
    region: "울산 중구 옥교동 (도심 골목시장)",
    type: "상설",
    hours: "보통 09:00 ~ 21:00 (상점마다 다름)",
    intro: "1922년 옥교시장에서 시작한 울산 중구 대표 골목시장. 곰장어 먹거리와 의류·잡화가 가득한 도심 시장이에요.",
    specialties: ["곰장어", "장터 먹거리", "청과·생선", "의류·잡화"],
    foods: [
      { name: "짚불 곰장어·곰장어볶음", desc: "울산 중구 명물. 매콤하게 볶거나 짚불에 구워 먹어요." },
      { name: "시장통닭·분식", desc: "옛날 통닭과 떡볶이·호떡 등 골목 간식이 풍성해요." },
      { name: "팥죽·국수", desc: "장 보다 출출할 때 한 그릇 하기 좋아요." },
    ],
    shops: [
      { name: "곰장어 먹자골목", desc: "곰장어집이 모여 있어 비교하며 들어가기 좋아요." },
      { name: "의류·잡화 골목", desc: "성남동 젊음의 거리와 이어져 구경거리가 많아요." },
    ],
    transport: {
      bus: [{ no: "울산 시내버스(성남동·중앙시장)", info: "중앙시장·성남동 정류장 하차 (노선 다수)" }],
      subway: "도시철도 없음 — 시내버스 이용, 울산시외·고속버스터미널에서 가까워요",
      note: "성남동 일대가 울산 도심이라 먹고 놀거리가 함께 있어요.",
    },
  },
  {
    id: "suam",
    name: "수암시장",
    region: "울산 남구 수암동 (한우 특화)",
    type: "상설",
    hours: "보통 09:00 ~ 21:00 / 한우야시장은 금·토 저녁",
    intro: "50년 역사의 울산 남구 대표 시장. 한우 정육식당이 모인 \"한우야시장\"으로 요즘 가장 핫해요. 회센터도 있어요.",
    specialties: ["한우", "회·수산", "청과·채소", "반찬"],
    foods: [
      { name: "한우 즉석구이", desc: "정육점에서 고기 사서 식당에서 바로 구워 먹어요. 저렴하고 신선해요." },
      { name: "한우 야시장(금·토)", desc: "저녁엔 한우 먹거리 야시장이 열려 활기차요." },
      { name: "회·물회", desc: "시장 안 회센터에서 신선한 회도 즐길 수 있어요." },
    ],
    shops: [
      { name: "한우 정육식당 거리", desc: "여러 정육점이 경쟁해 가격 비교하기 좋아요." },
      { name: "회센터", desc: "활어를 골라 떠 먹을 수 있어요." },
    ],
    transport: {
      bus: [{ no: "울산 시내버스(수암시장 방면)", info: "수암시장 인근 하차 (시간 확인 필요)" }],
      subway: "도시철도 없음 — 시내버스 이용",
      note: "한우야시장은 금·토 오후 6시 30분쯤부터 열려요(시즌제). 방문 전 일정 확인 권장.",
    },
  },
  {
    id: "ilsan",
    name: "일산시장",
    region: "울산 동구 일산동 (방어진 바닷가)",
    type: "상설",
    hours: "보통 08:00 ~ 20:00 (상점마다 다름)",
    intro: "방어진항·일산해수욕장 곁의 동구 바닷가 시장. 갓 잡은 해산물과 동구 명물 참가자미(용가자미)가 일품이에요.",
    specialties: ["참가자미(용가자미)", "방어·오징어", "돌미역·다시마", "건어물"],
    foods: [
      { name: "참가자미 회·구이", desc: "방어진 앞바다가 전국 최대 산지. 쫄깃한 가자미회가 별미예요." },
      { name: "방어회(겨울)·오징어(여름)", desc: "철 따라 방어·전어·오징어 등 제철 수산을 즐겨요." },
      { name: "돌미역국", desc: "울산 특산 돌미역으로 끓인 미역국은 깊은 맛이에요." },
    ],
    shops: [
      { name: "활어·수산 코너", desc: "수족관에서 골라 즉석에서 손질해 줘요." },
      { name: "건어물·미역 가게", desc: "돌미역·다시마·건어물을 선물용으로 사기 좋아요." },
    ],
    transport: {
      bus: [{ no: "울산 시내버스(일산동·방어진)", info: "일산해수욕장·방어진 인근 하차 (시간 확인 필요)" }],
      subway: "도시철도 없음 — 시내버스 이용",
      note: "일산해수욕장·대왕암공원과 가까워 바다 나들이와 함께하기 좋아요.",
    },
  },
  {
    id: "hogye",
    name: "호계공설시장",
    region: "울산 북구 호계동 (시골 5일장)",
    type: "5일장",
    ohDigits: [1, 6],          // 1·6일장
    hours: "보통 08:00 ~ 17:00 (장날)",
    intro: "울산 북구의 정겨운 5일장. 끝자리 1·6일이면 인근 농가의 농산물과 장터 먹거리가 가득해요.",
    specialties: ["제철 농산물", "산나물·약초", "장터 먹거리", "생활잡화"],
    foods: [
      { name: "장터국밥·국수", desc: "장날 따끈하게 말아주는 국밥·국수가 인기예요." },
      { name: "옛날 분식·떡", desc: "떡볶이·호떡·장떡 등 정겨운 간식거리가 많아요." },
      { name: "제철 나물·반찬거리", desc: "철마다 나는 나물로 반찬 장보기 좋아요." },
    ],
    shops: [
      { name: "농산물 난전", desc: "인근 농가가 직접 들고 나온 채소·나물이 가득해요." },
      { name: "먹자 코너", desc: "국밥·분식집이 모여 있어 장보고 한 끼 해결하기 좋아요." },
    ],
    transport: {
      bus: [{ no: "울산 시내버스(호계시장 방면)", info: "호계시장·호계역 인근 하차 (시간 확인 필요)" }],
      subway: "동해선 호계역에서 도보 약 5분",
      note: "장날(끝자리 1·6)엔 더 붐벼요. 동해선 전철로 닿기 편해요.",
    },
  },
  {
    id: "jeongja",
    name: "정자시장",
    region: "울산 북구 정자동 (정자항·시골 5일장)",
    type: "5일장",
    ohDigits: [2, 7],          // 2·7일장
    hours: "보통 08:00 ~ 18:00 (장날), 대게 직판장은 상시",
    intro: "동해 정자항을 낀 북구의 바닷가 5일장. 겨울 정자대게가 명물이고, 항구에서 올라온 싱싱한 회를 즐길 수 있어요.",
    specialties: ["정자대게", "활어회", "돌미역·건어물", "제철 생선"],
    foods: [
      { name: "정자대게(겨울 제철)", desc: "12~3월이 제철. 갓 들어온 대게를 쪄 먹는 맛이 일품이에요." },
      { name: "활어회·물회", desc: "정자항에서 올라온 제철 횟감으로 신선한 회를 즐겨요." },
      { name: "대게라면·해물", desc: "대게 국물을 우린 라면 등 별미도 있어요." },
    ],
    shops: [
      { name: "정자대게 직판장 거리", desc: "항구 따라 대게집이 줄지어 있어요. 골라서 쪄 먹기 좋아요." },
      { name: "활어·건어물 코너", desc: "제철 생선과 돌미역·건어물을 만날 수 있어요." },
    ],
    transport: {
      bus: [{ no: "울산 시내버스(정자·강동 방면)", info: "정자항·정자시장 인근 하차 (시간 확인 필요)" }],
      subway: "동해선 정자역에서 버스/택시로 이동",
      note: "대게는 겨울이 제철이에요. 강동해변 드라이브와 함께하면 좋아요.",
    },
  },
  {
    id: "sinjeong",
    name: "신정평화시장",
    region: "울산 남구 신정동 (도심 상설시장)",
    type: "상설",
    hours: "점포마다 다름 (보통 09:00 ~ 20:00 무렵)",
    intro: "울산 남구 도심의 대표 상설시장. 채소·과일·생선·반찬에 분식·먹자골목까지 갖춰 장보기와 한 끼 해결을 한 번에 할 수 있어요.",
    specialties: ["채소·과일", "생선·건어물", "반찬·먹거리", "생활잡화"],
    foods: [
      { name: "시장 분식·떡볶이", desc: "골목골목 분식집이 많아 떡볶이·튀김·순대로 든든하게." },
      { name: "갓 만든 반찬", desc: "반찬 가게가 모여 있어 그날그날 필요한 만큼 사기 좋아요." },
      { name: "제철 과일·채소", desc: "철마다 나는 과일·채소를 도심에서 편하게 살 수 있어요." },
    ],
    shops: [
      { name: "먹자골목", desc: "분식·국밥집이 줄지어 있어 장보고 한 끼 해결하기 좋아요." },
      { name: "반찬·건어물 코너", desc: "밑반찬·멸치·김 등 밥상 차림거리를 한자리에서." },
    ],
    transport: {
      bus: [{ no: "울산 시내버스(신정시장 방면)", info: "신정시장·공업탑 인근 하차 (시간 확인 필요)" }],
      subway: "도시철도 미운행 — 버스/택시 이용",
      note: "공업탑 로터리에서 가까워 시내 어디서든 닿기 편해요.",
    },
  },
  {
    id: "byeongyeong",
    name: "병영시장",
    region: "울산 중구 서동 병영 (상설·먹거리)",
    type: "상설",
    hours: "점포마다 다름 (보통 09:00 ~ 20:00 무렵)",
    intro: "조선시대 경상좌병영이 있던 중구 병영의 오랜 상설시장. 떡볶이·분식 등 먹거리로 소문난 정겨운 골목시장이에요.",
    specialties: ["떡볶이·분식", "반찬·먹거리", "채소·과일", "생활잡화"],
    foods: [
      { name: "병영 떡볶이", desc: "병영시장 하면 떡볶이! 매콤달콤한 옛날식 떡볶이가 명물이에요." },
      { name: "튀김·순대·김밥", desc: "떡볶이에 곁들이는 분식 삼총사. 골목마다 인기 집이 있어요." },
      { name: "갓 만든 반찬", desc: "밑반찬 가게가 많아 그날 필요한 반찬을 사기 좋아요." },
    ],
    shops: [
      { name: "분식 먹자골목", desc: "떡볶이·튀김집이 모여 있어 골라 먹는 재미가 있어요." },
      { name: "반찬·채소 코너", desc: "제철 채소와 밑반찬으로 장보기 좋아요." },
    ],
    transport: {
      bus: [{ no: "울산 시내버스(병영시장 방면)", info: "병영시장·서동 인근 하차 (시간 확인 필요)" }],
      subway: "도시철도 미운행 — 버스/택시 이용",
      note: "병영성 일대와 함께 둘러보기 좋아요.",
    },
  },
  {
    id: "taehwa",
    name: "태화시장",
    region: "울산 중구 태화동 (태화강 인근 상설)",
    type: "상설",
    hours: "점포마다 다름 (보통 09:00 ~ 20:00 무렵)",
    intro: "태화강 가까이 자리한 중구의 상설시장. 채소·생선·반찬에 분식거리까지 갖춰 동네 장보기에 두루 좋아요.",
    specialties: ["채소·과일", "생선·건어물", "반찬·분식", "생활잡화"],
    foods: [
      { name: "시장 분식", desc: "떡볶이·튀김·호떡 등 정겨운 간식거리가 많아요." },
      { name: "갓 만든 반찬", desc: "반찬 가게가 모여 있어 밥상 차림거리를 한 번에." },
      { name: "제철 채소·과일", desc: "철마다 나는 채소·과일을 동네에서 편하게 사요." },
    ],
    shops: [
      { name: "반찬·건어물 코너", desc: "밑반찬·멸치·김 등을 한자리에서 살 수 있어요." },
      { name: "채소·과일 난전", desc: "제철 채소·과일이 가득해 장보기 좋아요." },
    ],
    transport: {
      bus: [{ no: "울산 시내버스(태화시장·태화로터리 방면)", info: "태화시장 인근 하차 (시간 확인 필요)" }],
      subway: "도시철도 미운행 — 버스/택시 이용",
      note: "태화강국가정원 나들이와 함께하면 좋아요.",
    },
  },
  {
    id: "bangeojin",
    name: "방어진중앙시장",
    region: "울산 동구 방어동 (방어진항 상설·수산)",
    type: "상설",
    hours: "점포마다 다름 (보통 08:00 ~ 19:00 무렵)",
    intro: "방어진항을 낀 동구의 상설시장. 항구에서 갓 올라온 생선·건어물이 풍성하고, 회·해산물 먹거리로도 유명해요.",
    specialties: ["활어회·해산물", "생선·건어물", "제철 수산물", "반찬거리"],
    foods: [
      { name: "활어회·물회", desc: "방어진항에서 올라온 제철 횟감으로 신선한 회를 즐겨요." },
      { name: "갓 잡은 생선구이", desc: "고등어·가자미 등 그날의 생선을 구워 먹는 맛이 일품." },
      { name: "건어물·젓갈", desc: "말린 생선·미역·젓갈을 저렴하게 살 수 있어요." },
    ],
    shops: [
      { name: "활어·수산 코너", desc: "항구에서 바로 온 제철 생선과 조개를 만날 수 있어요." },
      { name: "건어물 거리", desc: "돌미역·멸치·건어물이 가득해요." },
    ],
    transport: {
      bus: [{ no: "울산 시내버스(방어진·일산해수욕장 방면)", info: "방어진시장 인근 하차 (시간 확인 필요)" }],
      subway: "도시철도 미운행 — 버스/택시 이용",
      note: "대왕암공원·일산해수욕장과 함께 둘러보기 좋아요.",
    },
  },
  {
    id: "deokha",
    name: "덕하시장 (덕하 5일장)",
    region: "울산 울주군 청량읍 (시골 5일장)",
    type: "5일장",
    ohDigits: [4, 9],          // 4·9일장
    hours: "보통 08:00 ~ 17:00 (장날)",
    intro: "울주군 청량읍의 오래된 5일장. 끝자리 4·9일이면 인근 농가의 농산물과 장터 먹거리가 가득해요.",
    specialties: ["제철 농산물", "산나물·약초", "장터 먹거리", "생활잡화"],
    foods: [
      { name: "장터국밥·국수", desc: "장날 따끈하게 말아주는 국밥·국수가 인기예요." },
      { name: "옛날 분식·떡", desc: "떡볶이·호떡·장떡 등 정겨운 간식거리가 많아요." },
      { name: "제철 나물·반찬거리", desc: "철마다 나는 나물로 반찬 장보기 좋아요." },
    ],
    shops: [
      { name: "농산물 난전", desc: "인근 농가가 직접 들고 나온 채소·나물이 가득해요." },
      { name: "먹자 코너", desc: "국밥·분식집이 모여 있어 장보고 한 끼 해결하기 좋아요." },
    ],
    transport: {
      bus: [{ no: "울산 시내버스(덕하시장 방면)", info: "덕하시장·덕하역 인근 하차 (시간 확인 필요)" }],
      subway: "동해선 덕하역에서 도보 이동",
      note: "장날(끝자리 4·9)엔 더 붐벼요. 동해선 전철로 닿기 편해요.",
    },
  },
];

// ===== 계절별(이번 달) 제철 식재료 — 지역·해마다 조금씩 달라요 =====
const SEASONAL = {
  1: ["굴", "딸기", "한라봉", "시금치", "우엉", "과메기", "대구"],
  2: ["딸기", "바지락", "냉이", "봄동", "미나리", "한라봉", "도미"],
  3: ["냉이", "달래", "쑥", "봄동", "주꾸미", "바지락", "더덕"],
  4: ["두릅", "죽순", "달래", "쑥", "주꾸미", "멍게", "미나리"],
  5: ["마늘종", "죽순", "두릅", "매실", "멸치", "다슬기", "완두콩"],
  6: ["감자", "마늘", "양파", "매실", "살구", "한치", "토마토", "보리"],
  7: ["옥수수", "복숭아", "자두", "수박", "참외", "가지", "애호박", "민어"],
  8: ["복숭아", "포도", "옥수수", "전복", "토마토", "풋고추", "고구마순"],
  9: ["사과", "배", "밤", "대하", "전어", "토란", "햇고구마", "햅쌀"],
  10: ["사과", "배", "감", "꽃게", "대하", "고등어", "무", "배추"],
  11: ["귤", "사과", "배추", "무", "굴", "과메기", "대게", "단호박"],
  12: ["굴", "귤", "한라봉", "시금치", "배추", "방어", "명태", "유자"],
};

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

// 5일장 다음 장날 계산 (끝자리 기준)
function nextMarketDay(ohDigits) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 12; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    if (ohDigits.includes(d.getDate() % 10)) return { date: d, dday: i };
  }
  return null;
}

function ddayText(ohDigits) {
  const n = nextMarketDay(ohDigits);
  if (!n) return { label: "장날 정보 확인 필요", today: false };
  const m = n.date.getMonth() + 1, day = n.date.getDate(), w = WEEK[n.date.getDay()];
  if (n.dday === 0) return { label: `🎉 오늘 장날! (${m}/${day} ${w})`, today: true };
  return { label: `다음 장날 ${m}/${day}(${w}) · D-${n.dday}`, today: false };
}

// ---------- 목록 렌더 ----------
const listView = document.getElementById("listView");
const detailView = document.getElementById("detailView");
const marketList = document.getElementById("marketList");
let curFilter = "all";
let curRegion = "all";

// 지역(시·도)은 region 문자열 첫 단어로 그룹화해요. 예) "울산 중구 ..." → "울산"
function regionOf(m) {
  return (m.region || "").trim().split(/\s+/)[0] || "기타";
}

function renderList() {
  const items = MARKETS.filter((m) =>
    (curFilter === "all" || m.type === curFilter) &&
    (curRegion === "all" || regionOf(m) === curRegion)
  );
  if (!items.length) {
    marketList.innerHTML = `<div class="list-empty">해당 조건의 시장이 없어요. 다른 지역·유형을 골라보세요.</div>`;
    return;
  }
  marketList.innerHTML = items.map((m) => {
    const badge = m.type === "5일장"
      ? `<span class="mc-badge badge-5">5일장</span>`
      : `<span class="mc-badge badge-everyday">상설</span>`;
    let dday = "";
    if (m.type === "5일장") {
      const d = ddayText(m.ohDigits);
      dday = `<div class="mc-dday ${d.today ? "today" : ""}">🗓️ ${d.label}</div>`;
    } else {
      dday = `<div class="mc-dday">🟢 매일 영업</div>`;
    }
    const chips = (m.specialties || []).slice(0, 4).map((s) => `<span>${esc(s)}</span>`).join("");
    return `<div class="market-card" data-id="${m.id}">
      <div class="mc-top"><span class="mc-name">${esc(m.name)}</span>${badge}</div>
      <div class="mc-region">📍 ${esc(m.region)}</div>
      ${dday}
      <div class="mc-chips">${chips}</div>
      <div class="mc-go">자세히 보기 →</div>
    </div>`;
  }).join("");
  marketList.querySelectorAll(".market-card").forEach((c) => {
    c.addEventListener("click", () => showDetail(c.dataset.id));
  });
}

// ---------- 상세 렌더 ----------
function showDetail(id) {
  const m = MARKETS.find((x) => x.id === id);
  if (!m) return;
  const badge = m.type === "5일장"
    ? `<span class="mc-badge badge-5">5일장</span>` : `<span class="mc-badge badge-everyday">상설</span>`;

  let schedule;
  if (m.type === "5일장") {
    const d = ddayText(m.ohDigits);
    const digits = m.ohDigits.join("·");
    schedule = `<div class="d-row"><span class="k">장날</span><span>끝자리 <strong>${digits}</strong>일 (5일장)</span></div>
      <div class="d-row"><span class="k">다음</span><span class="d-dday ${d.today ? "today" : ""}">${d.label}</span></div>`;
  } else {
    schedule = `<div class="d-row"><span class="k">영업</span><span><strong>매일 영업</strong> (상설시장)</span></div>`;
  }

  const busRows = (m.transport?.bus || []).map((b) =>
    `<div class="bus-line"><span class="bus-no">${esc(b.no)}</span><span>${esc(b.info)}</span></div>`).join("")
    || `<p class="muted" style="font-size:14px">버스 정보를 추가해 주세요.</p>`;

  const foods = (m.foods || []).map((f) =>
    `<div class="food-item"><strong>🍜 ${esc(f.name)}</strong><p>${esc(f.desc)}</p></div>`).join("");
  const shops = (m.shops || []).map((s) =>
    `<div class="shop-item"><strong>🏪 ${esc(s.name)}</strong><p>${esc(s.desc)}</p></div>`).join("");
  const specs = (m.specialties || []).map((s) => `<span>${esc(s)}</span>`).join("");

  const hasGeo = m.lat && m.lng;
  const dirUrl = hasGeo ? `https://map.kakao.com/link/to/${encodeURIComponent(m.name)},${m.lat},${m.lng}` : `https://map.kakao.com/?q=${encodeURIComponent(m.name)}`;
  const mapUrl = hasGeo ? `https://map.kakao.com/link/map/${encodeURIComponent(m.name)},${m.lat},${m.lng}` : `https://map.kakao.com/?q=${encodeURIComponent(m.name)}`;

  detailView.innerHTML = `
    <button class="back-btn" id="backBtn">← 목록으로</button>
    <div class="detail-head">
      <h1>${esc(m.name)}</h1>
      <div class="mc-region">📍 ${esc(m.region)}</div>
      ${badge}
      <p class="d-intro">${esc(m.intro || "")}</p>
    </div>

    <div class="d-block">
      <h2>🗓️ 운영 · 장날</h2>
      ${schedule}
      <div class="d-row"><span class="k">시간</span><span>${esc(m.hours || "확인 필요")}</span></div>
    </div>

    <div class="d-block">
      <h2>🔥 이 시장의 주무기</h2>
      <div class="spec-chips">${specs}</div>
      <div style="margin-top:14px">${foods}</div>
      <button class="recipe-btn" id="recipeBtn">🍳 이 특산물로 뭐 해먹지? <span class="ai-tag">AI</span></button>
      <div class="recipe-result" id="recipeResult" hidden></div>
    </div>

    ${shops ? `<div class="d-block"><h2>🏪 대표 가게·코너</h2>${shops}</div>` : ""}

    <div class="d-block">
      <h2>🚌 가는 길</h2>
      ${busRows}
      ${m.transport?.subway ? `<div class="d-row"><span class="k">지하철</span><span>${esc(m.transport.subway)}</span></div>` : ""}
      ${m.transport?.note ? `<div class="d-row"><span class="k">팁</span><span>${esc(m.transport.note)}</span></div>` : ""}
      <div class="d-actions">
        <a class="d-btn primary" href="${dirUrl}" target="_blank" rel="noopener">🧭 길찾기</a>
        <a class="d-btn ghost" href="${mapUrl}" target="_blank" rel="noopener">🗺️ 지도에서 보기</a>
      </div>
    </div>`;

  listView.hidden = true;
  detailView.hidden = false;
  document.getElementById("backBtn").addEventListener("click", showList);
  const rb = document.getElementById("recipeBtn");
  if (rb) rb.addEventListener("click", () => askRecipe(m.specialties || [], m.name, "recipeResult", rb));
  window.scrollTo({ top: 0 });
}

function showList() {
  detailView.hidden = true;
  listView.hidden = false;
  window.scrollTo({ top: 0 });
}

// ---------- 필터 / 공통 ----------
// 유형 필터(전체/5일장/상설)
document.getElementById("filters").querySelectorAll(".filter").forEach((b) => {
  b.addEventListener("click", () => {
    document.getElementById("filters").querySelectorAll(".filter").forEach((x) => x.classList.remove("is-on"));
    b.classList.add("is-on");
    curFilter = b.dataset.f;
    renderList();
  });
});

// 지역 필터(전국 + 시·도) — MARKETS에서 자동 생성, 시장 추가하면 알아서 늘어나요
(function buildRegionFilters() {
  const box = document.getElementById("regionFilters");
  if (!box) return;
  const order = ["서울", "인천", "경기", "강원", "충북", "충남", "대전", "세종",
    "전북", "전남", "광주", "경북", "대구", "경남", "부산", "울산", "제주"];
  const present = [...new Set(MARKETS.map(regionOf))]
    .sort((a, b) => (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b)));
  box.innerHTML = `<button class="rfilter is-on" data-r="all">전국</button>`
    + present.map((r) => `<button class="rfilter" data-r="${esc(r)}">${esc(r)}</button>`).join("");
  box.querySelectorAll(".rfilter").forEach((b) => {
    b.addEventListener("click", () => {
      box.querySelectorAll(".rfilter").forEach((x) => x.classList.remove("is-on"));
      b.classList.add("is-on");
      curRegion = b.dataset.r;
      renderList();
    });
  });
})();
document.getElementById("homeBtn").addEventListener("click", (e) => { e.preventDefault(); showList(); });
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- 이번 달 제철 식재료 ----------
function renderSeasonal() {
  const box = document.getElementById("seasonal");
  if (!box) return;
  const month = new Date().getMonth() + 1;
  const items = SEASONAL[month] || [];
  box.innerHTML = `
    <div class="seasonal-card">
      <h2>🥬 ${month}월 제철 식재료</h2>
      <p class="muted">시장 가서 이것부터 찾아보세요! 제일 맛있고 저렴할 때예요.</p>
      <div class="season-chips">${items.map((s) => `<span>${esc(s)}</span>`).join("")}</div>
      <button class="recipe-btn" id="seasonRecipeBtn">🍳 이번 달 제철로 뭐 해먹지? <span class="ai-tag">AI</span></button>
      <div class="recipe-result" id="seasonRecipeResult" hidden></div>
    </div>`;
  const sb = document.getElementById("seasonRecipeBtn");
  if (sb) sb.addEventListener("click", () => askRecipe(items, `${month}월 제철 식재료`, "seasonRecipeResult", sb));
}
renderSeasonal();

// ---------- AI 요리 추천 ("이 특산물로 뭐 해먹지?") ----------
const MARKET_API = (window.MARKET_API_BASE || "").replace(/\/$/, "");
async function askRecipe(ingredients, title, resultId, btn) {
  const box = document.getElementById(resultId);
  if (!box) return;
  if (!MARKET_API) {
    box.hidden = false;
    box.textContent = "AI 요리 추천은 백엔드 연결 후 켜져요. (config.js에 Worker 주소 입력)";
    return;
  }
  box.hidden = false;
  box.textContent = "🍳 맛있는 메뉴 떠올리는 중…";
  btn.disabled = true;
  try {
    const res = await fetch(MARKET_API + "/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients, market: title }),
    });
    if (!res.ok) throw new Error("server " + res.status);
    const data = await res.json();
    box.textContent = (data.reply || "").trim() || "추천을 받지 못했어요. 잠시 후 다시 시도해 주세요.";
  } catch (e) {
    box.textContent = "지금은 추천을 불러오지 못했어요. 잠시 후 다시 시도해 주세요. (AI 추천은 백엔드 업데이트가 필요할 수 있어요)";
  } finally {
    btn.disabled = false;
  }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

renderList();
