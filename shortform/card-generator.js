/**
 * 숏폼 떡상 판독기 Pro — 1초 바이럴 성적표 캔버스 렌더러
 * (Instagram Story & KakaoTalk 최적화 고해상도 티켓 이미지 생성기)
 */

const CardGenerator = {
  canvas: null,
  ctx: null,

  init() {
    this.canvas = document.getElementById('scorecardCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  },

  draw(data) {
    if (!this.canvas) this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const width = 750;
    const height = 920;
    this.canvas.width = width;
    this.canvas.height = height;

    const {
      platform = 'youtube',
      platformLabel = '유튜브 쇼츠',
      title = '영상 제목',
      tier = 'S',
      tierTitle = '바이럴 챔피언 👑',
      score = 89,
      views = 0,
      engagementRate = '8.5%',
      secondaryMetricLabel = '완주율',
      secondaryMetricValue = '72%',
      prescription = '첫 3초 후킹이 치명적입니다. 댓글 유도 질문을 추가하세요!'
    } = data;

    // Platform Colors
    let themeColor = '#ff334b';
    let themeGradEnd = '#ff7849';
    if (platform === 'reels') {
      themeColor = '#e1306c';
      themeGradEnd = '#f77737';
    } else if (platform === 'tiktok') {
      themeColor = '#00f2fe';
      themeGradEnd = '#fe2c55';
    }

    // Tier Color Palette
    const tierColors = {
      'SSS': '#ff0055',
      'S': '#f59e0b',
      'A': '#3182f6',
      'B': '#10b981',
      'C': '#8b5cf6',
      'F': '#64748b'
    };
    const tierColor = tierColors[tier] || '#f59e0b';

    // 1. Background Fill (Dark Luxury Slate)
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, 0, width, height);

    // Subtle background gradient glow
    const bgGlow = ctx.createRadialGradient(width / 2, 280, 20, width / 2, 280, 360);
    bgGlow.addColorStop(0, tierColor + '33'); // 20% opacity
    bgGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    // Subtle Grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 30; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 30; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    this.roundRect(ctx, 24, 24, width - 48, height - 48, 28, false, true);

    // 2. Header Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    this.roundRect(ctx, 40, 40, width - 80, 70, 16, true, false);

    // Header Tag
    ctx.font = 'bold 15px Pretendard, sans-serif';
    ctx.fillStyle = '#8b95a1';
    ctx.fillText('ALGORITHM VIRAL SCORECARD', 60, 80);

    // Platform Badge in Header
    ctx.fillStyle = themeColor;
    this.roundRect(ctx, width - 200, 52, 140, 44, 12, true, false);
    ctx.font = 'bold 16px Pretendard, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(platformLabel, width - 130, 80);
    ctx.textAlign = 'left';

    // 3. Title Section
    ctx.font = 'bold 24px Pretendard, sans-serif';
    ctx.fillStyle = '#ffffff';
    const displayTitle = title.length > 28 ? title.slice(0, 27) + '...' : title;
    ctx.fillText('🎬 ' + displayTitle, 50, 160);

    // Divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, 185);
    ctx.lineTo(width - 50, 185);
    ctx.stroke();

    // 4. Center Tier Seal & Score
    const centerX = width / 2;
    const centerY = 330;

    // Glowing Ring
    ctx.save();
    ctx.shadowColor = tierColor;
    ctx.shadowBlur = 24;
    ctx.strokeStyle = tierColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 84, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Inner Circle
    ctx.fillStyle = '#161d28';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 78, 0, Math.PI * 2);
    ctx.fill();

    // Big Tier Text
    ctx.font = '900 80px Pretendard, sans-serif';
    ctx.fillStyle = tierColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tier, centerX, centerY + 4);

    // Tier Title Banner
    ctx.font = 'bold 30px Pretendard, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(tierTitle, centerX, 465);

    // Score Text
    ctx.font = '700 20px Pretendard, sans-serif';
    ctx.fillStyle = '#8b95a1';
    ctx.fillText(`알고리즘 종합 떡상 점수 : `, centerX - 40, 505);
    ctx.font = '900 28px Pretendard, sans-serif';
    ctx.fillStyle = tierColor;
    ctx.fillText(`${score}점`, centerX + 110, 505);
    ctx.textBaseline = 'alphabetic'; // reset

    // 5. 3 Metrics Badges
    const pillY = 550;
    const pillW = 200;
    const pillH = 100;
    const pillGap = 16;
    const startX = (width - (pillW * 3 + pillGap * 2)) / 2;

    const metricsArr = [
      { label: '조회수', val: this.fmtNum(views) + '회', sub: '노출 지표' },
      { label: '참여율', val: engagementRate, sub: '인터랙션' },
      { label: secondaryMetricLabel, val: secondaryMetricValue, sub: '알고리즘 핵심' }
    ];

    metricsArr.forEach((m, idx) => {
      const px = startX + idx * (pillW + pillGap);
      ctx.fillStyle = '#18202c';
      this.roundRect(ctx, px, pillY, pillW, pillH, 16, true, false);

      // Label
      ctx.font = 'bold 14px Pretendard, sans-serif';
      ctx.fillStyle = '#8b95a1';
      ctx.textAlign = 'center';
      ctx.fillText(m.label, px + pillW / 2, pillY + 32);

      // Value
      ctx.font = '900 24px Pretendard, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(m.val, px + pillW / 2, pillY + 65);

      // Sub
      ctx.font = '11px Pretendard, sans-serif';
      ctx.fillStyle = themeColor;
      ctx.fillText(m.sub, px + pillW / 2, pillY + 86);
    });

    // 6. 1-Line Prescription Box
    const prescY = 675;
    ctx.fillStyle = 'rgba(49, 130, 246, 0.12)';
    this.roundRect(ctx, 48, prescY, width - 96, 120, 18, true, false);
    
    // Left Accent bar
    ctx.fillStyle = '#3182f6';
    this.roundRect(ctx, 48, prescY, 6, 120, 3, true, false);

    // Prescription Header
    ctx.font = 'bold 16px Pretendard, sans-serif';
    ctx.fillStyle = '#3182f6';
    ctx.textAlign = 'left';
    ctx.fillText('💡 수석개발부장 루시안의 떡상 처방', 72, prescY + 38);

    // Prescription Content (wrap 2 lines if needed)
    ctx.font = '500 17px Pretendard, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    this.wrapText(ctx, prescription, 72, prescY + 70, width - 140, 24);

    // 7. Footer Watermark
    const footerY = 855;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(50, footerY - 25);
    ctx.lineTo(width - 50, footerY - 25);
    ctx.stroke();

    ctx.font = 'bold 15px Pretendard, sans-serif';
    ctx.fillStyle = '#8b95a1';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ 디지털다락방 LUCA · AI 트렌드 대시보드', 50, footerY);

    ctx.font = '14px Pretendard, sans-serif';
    ctx.fillStyle = '#4e5968';
    ctx.textAlign = 'right';
    ctx.fillText('luca-darakbang.netlify.app/shortform', width - 50, footerY);
    ctx.textAlign = 'left';
  },

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  },

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let curY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
  },

  fmtNum(n) {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }
};

function downloadScorecard() {
  const canvas = document.getElementById('scorecardCanvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `숏폼_떡상_성적표_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

async function copyScorecardImage() {
  const canvas = document.getElementById('scorecardCanvas');
  if (!canvas) return;
  try {
    canvas.toBlob(async blob => {
      if (!blob) throw new Error('Blob 변환 실패');
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert('✨ 떡상 성적표 이미지가 클립보드에 복사되었습니다! 인스타/단톡방에 바로 붙여넣기(Ctrl+V) 하세요.');
      } else {
        downloadScorecard();
      }
    });
  } catch (err) {
    downloadScorecard();
  }
}
