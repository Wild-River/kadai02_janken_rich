const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const levelEl = document.getElementById('level');
const statusEl = document.getElementById('status');

const hammer = document.getElementById('hammer');
const startBtn = document.getElementById('start-btn');

const gameField = document.getElementById('game-field');
const HOLES = document.querySelectorAll('.hole');
const message = document.getElementById('message');
const levelUp = document.getElementById('level-up');

const ruleModal = document.getElementById('rule-modal');
const ruleBtn = document.getElementById('rule-btn');
const okBtn = document.getElementById('ok-btn');

okBtn.addEventListener('click', () => {
  ruleModal.style.display = 'none';
});

let score = 0;
let timeLeft = 30; //残り時間（減っていく）
let level = 1;
let timerId = null;
let isActive = false;
let currentLevel = 1;
showHistory();
gameField.style.display = 'none';

// ハンマーアニメーション
const anim = lottie.loadAnimation({
  container: hammer,
  renderer: 'svg',
  loop: false, // ループしない
  autoplay: false, // 自動再生しない
  path: 'lottie/hammer.json',
});

hammer.style.display = 'none';
hammer.style.pointerEvents = 'none';
const trackAreas = [gameField, startBtn];

trackAreas.forEach((area) => {
  area.addEventListener('mousemove', (e) => {
    hammer.style.left = e.clientX - 40 + 'px';
    hammer.style.top = e.clientY - 80 + 'px';
  });

  area.addEventListener('mouseenter', () => {
    hammer.style.display = 'block';
  });

  area.addEventListener('mouseleave', () => {
    hammer.style.display = 'none';
  });
});

// クリックで再生
gameField.addEventListener('mousedown', () => {
  anim.goToAndPlay(0, true);
});

const AUDIO = {
  appearance: new Audio('audio/appearance.mp3'),
  bgm01: new Audio('audio/bgm01.mp3'),
  bgm02: new Audio('audio/bgm02.mp3'),
  bgm03: new Audio('audio/bgm03.mp3'),
  hit: new Audio('audio/hit.mp3'),
  level: new Audio('audio/level.mp3'),
  fanfare: new Audio('audio/fanfare.mp3'),
  piko: new Audio('audio/piko.mp3'),
  score: new Audio('audio/score.mp3'),
  wao: new Audio('audio/wao.mp3'),
  // timer: new Audio('audio/timer.mp3'),
  whistle: new Audio('audio/whistle.mp3'),
};
// 連続ヒット判定用
function playScore() {
  const sound = AUDIO.score.cloneNode();
  sound.muted = isMuted;
  sound.play();
}

// ミュートボタン
const muteBtn = document.querySelector('#mute-btn');
let isMuted = false;
const iconOn = document.querySelector('#icon-volume-on');
const iconOff = document.querySelector('#icon-volume-off');
iconOff.style.display = 'none';

muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  Object.values(AUDIO).forEach((audio) => {
    audio.muted = isMuted;
  });
  iconOn.style.display = isMuted ? 'none' : 'block';
  iconOff.style.display = isMuted ? 'block' : 'none';
});

// BGM切り替え処理
const bgmBtns = document.querySelectorAll('.bgm-btn');
let activeBgm = null; // 現在再生中のトラック名

bgmBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const track = `bgm${btn.dataset.bgm}`;

    // 同じボタンをクリック → STOP
    if (activeBgm === track) {
      btn.classList.remove('ring-2', 'ring-white');
      activeBgm = null;
      return;
    }

    // 別のBGMに切り替え
    activeBgm = track;

    // ハイライト切り替え
    bgmBtns.forEach((b) => b.classList.remove('ring-2', 'ring-white'));
    btn.classList.add('ring-2', 'ring-white');
  });
});

//メッセージを点滅
let hitVisible = false;
let levelUpVisible = false;

//ステータスメッセージを点滅
let visible = true;
setInterval(() => {
  visible = !visible;
  statusEl.style.opacity = visible ? 1 : 0;
}, 1000);

// - モグラが出る・引っ込む
const HOLE_COUNT = 7;
let holes = new Array(HOLE_COUNT).fill(false); //各穴に「モグラが出ているか」

function activateMole() {
  let i = Math.floor(Math.random() * HOLE_COUNT);
  let appearDelay = Math.floor(Math.random() * 1000);

  setTimeout(() => {
    showMole(i);
  }, appearDelay);
}

function showMole(index) {
  holes[index] = true;
  HOLES[index].querySelector('.mole').classList.add('active');
  let stayDuration = Math.floor(Math.random() * 2000);

  setTimeout(() => {
    hideMole(index);
  }, stayDuration);
}

function hideMole(index) {
  holes[index] = false;
  HOLES[index].querySelector('.mole').classList.remove('active');

  if (isActive) {
    activateMole();
  }
}

const moleHitMap = {
  'mogura01.webp': 'mogura01_hit.webp',
  'mogura02.webp': 'mogura02_hit.webp',
  'mogura03.webp': 'mogura03_hit.webp',
};

// - モグラをクリックする → ヒット判定
HOLES.forEach((hole, index) => {
  hole.addEventListener('click', function () {
    AUDIO.piko.play();

    if (holes[index]) {
      score += 1;

      message.textContent = 'ヒット！！';

      const hitInterval = setInterval(() => {
        hitVisible = !hitVisible;
        message.style.opacity = hitVisible ? 1 : 0;
      }, 100);
      setTimeout(() => {
        clearInterval(hitInterval);
        message.style.opacity = 0;
      }, 1000);

      playScore();
      updateDisplay();

      // 現在の画像からヒット画像を取得
      const moleImg = HOLES[index].querySelector('.mole');
      const currentFile = moleImg.src.split('/').pop(); // ファイル名だけ取得
      const hitFile = moleHitMap[currentFile];

      moleImg.src = `img/${hitFile}`;

      setTimeout(() => {
        moleImg.src = `img/${currentFile}`;
      }, 600);

      setTimeout(() => {
        hideMole(index);
      }, 600);
    }
  });
});

function levelUpDisplay() {
  levelUp.textContent = 'レベルアップ！';

  const levelUpInterval = setInterval(() => {
    levelUpVisible = !levelUpVisible;
    levelUp.style.opacity = levelUpVisible ? 1 : 0;
  }, 100);
  setTimeout(() => {
    clearInterval(levelUpInterval);
    levelUp.style.opacity = 0;
  }, 1000);
}

// 画面の更新
function updateDisplay() {
  level = Math.floor(score / 5) + 1;
  if (level > currentLevel) {
    AUDIO.fanfare.play();
    currentLevel = level;
    levelUpDisplay();
  }
  levelEl.textContent = level;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;

  if (timeLeft <= 5) {
    // AUDIO.timer.play();

    timeEl.classList.remove('text-cyan-500');
    timeEl.classList.add('text-red-500');
  }
}

// ゲームスタート
function startGame() {
  AUDIO.level.play();
  gameField.style.display = 'block';
  statusEl.textContent = '判定中...';
  startBtn.style.display = 'none';

  if (isActive) return;
  const bgmTrack = activeBgm || 'bgm01';
  AUDIO[bgmTrack].play();

  isActive = true;
  updateDisplay();

  timerId = setInterval(() => {
    timeLeft -= 1;
    updateDisplay();

    // ゲーム終了時に止める
    if (timeLeft <= 0) {
      gameField.style.display = 'none';
      const bgmTrack = activeBgm || 'bgm01';
      AUDIO[bgmTrack].pause();
      AUDIO.whistle.play();

      clearInterval(timerId);
      isActive = false;
      hammer.style.display = 'none';
      saveResult();
      statusEl.textContent = 'ゲーム終了！  スコア：' + score + ' レベル：' + level;

      setTimeout(() => {
        resetGame();
      }, 5000);
    }
  }, 1000);

  activateMole();
}

// スコアを保存
function saveResult() {
  const result = {
    score: score,
    level: level,
    date: new Date().toLocaleDateString('ja-JP'),
  };

  // 既存の履歴を取得
  const history = JSON.parse(localStorage.getItem('mogura_history') || '[]');
  history.unshift(result); // 先頭に追加

  // 最新10件だけ保存
  const trimmed = history.slice(0, 10);
  localStorage.setItem('mogura_history', JSON.stringify(trimmed));
}

// 履歴を表示
function showHistory() {
  const historyList = document.getElementById('history-list');
  const history = JSON.parse(localStorage.getItem('mogura_history') || '[]');

  if (history.length === 0) {
    historyList.innerHTML = '<li>まだ記録がありません</li>';
    return;
  }

  const sorted = [...history].sort((a, b) => {
    if (Number(b.level) !== Number(a.level)) return Number(b.level) - Number(a.level);
    return Number(b.score) - Number(a.score);
  });

  historyList.innerHTML = sorted.map((r, i) => `<li>${i + 1}位　${r.date}　スコア: ${r.score}　レベル: ${r.level}</li>`).join('');
}

// 説明ボタンクリックで履歴を表示
ruleBtn.addEventListener('click', () => {
  showHistory();
  ruleModal.style.display = 'flex';
});

// ゲーム終了
function resetGame() {
  clearInterval(timerId);

  HOLES.forEach((hole, index) => {
    holes[index] = false;
    hole.querySelector('.mole').classList.remove('active');
  });

  const bgmTrack = activeBgm || 'bgm01';
  AUDIO[bgmTrack].pause();
  AUDIO[bgmTrack].currentTime = 0;
  AUDIO[bgmTrack].volume = 1;

  isActive = false;
  score = 0;
  timeLeft = 30;
  level = 1;
  currentLevel = 1;
  timeEl.classList.remove('text-red-500');
  timeEl.classList.add('text-cyan-500');
  updateDisplay();
  startBtn.style.display = 'inline-block';
  statusEl.textContent = 'スタートボタンを押してね！';
}

//ゲーム開始
startBtn.addEventListener('click', startGame);
