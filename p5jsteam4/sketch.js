// =====================================
// FULLSCREEN STYLE (스크롤바 완전 제거 및 꽉 채우기)
// =====================================
let style = document.createElement('style');
style.innerHTML = `
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: rgb(18, 40, 18);
  width: 100%;
  height: 100%;
}
canvas {
  display: block;
}
`;
document.head.appendChild(style);

// =====================================
// 전체 게임 상태 관리 (통합 상태 머신)
// =====================================
// "TITLE"(first.jpg) -> "STORY_1" -> "MINIGAME_MAZE" -> "STORY_2" ->
// "MINIGAME_CAVE_START" -> "MINIGAME_CAVE_INTRO" -> "MINIGAME_CAVE_PLAYING" ->
// "MINIGAME_CAVE_CHEST" -> "MINIGAME_CAVE_KEY" -> "MINIGAME_CAVE_DIALOGUE" ->
// "MINIGAME_CAVE_CLEAR" -> "STORY_3" -> "MINIGAME_FOREST" -> "STORY_4"(hiro9) -> "CREDITS"
let gameState = "TITLE";
let enteredFullscreen = false;

// =====================================
// 스토리 모드 변수들 (.jpg 확장자 유지)
// =====================================
let bgImages = {};

let dialogues1 = [
  { name: "히로", text: "으음...?", bg: "hiro1.jpg" },
  { name: "히로", text: "여기가 어디지?", bg: "hiro1.jpg" },
  { name: "히로", text: "분명 어젯밤엔 내 방에서 잠들었는데...", bg: "hiro1.jpg" },
  { name: "", text: "꿈인가 싶어 팔을 꼬집어봤지만 아팠다.", bg: "hiro1.jpg" },
  { name: "", text: "믿기지 않지만, 이 모든 것이 현실임을 알게 된 나는 상황을 파악하기 위해 주변을 살펴보기로 했다.", bg: "hiro1.jpg" },
  { name: "", text: "한참을 걸어다녔지만 온통 모르는 풍경 뿐이었다.", bg: "hiro3.jpg" },
  { name: "히로", text: "이제 나는 어떻게 해야 하지? 집에 가고 싶어...", bg: "hiro3.jpg" },
  { name: "", text: "걸어다니다가 지친 나는 잠시 쉬려고 했다.", bg: "hiro3.jpg" },
  { name: "", text: "그러나, 눈 앞에 이상한 물체가 날아왔다.", bg: "hiro3.jpg" },
  { name: "히로", text: "으악! 뭐야?!", bg: "hiro2.jpg" },
  { name: "요정", text: "미안, 놀랐어?", bg: "hiro2.jpg" },
  { name: "요정", text: "나는 이곳의 요정이야.나는 너처럼 이곳으로 흘러들어온 아이들을 원래 세계로 인도해주는 역할을 맡고 있어.", bg: "hiro2.jpg" },
  { name: "히로", text: "뭐? 그러면 집에 갈 수 있는 거야?", bg: "hiro2.jpg" },
  { name: "요정", text: "당연하지! 나만 믿고 따라와!", bg: "hiro2.jpg" },
  { name: "", text: "요정을 믿고 걸어갔더니 이상한 풍경이 눈 앞에 보인다...", bg: "hiro4.jpg" },
  { name: "히로", text: "...분명 너만 믿으면 된다고 하지 않았어?", bg: "hiro4.jpg" },
  { name: "요정", text: "...그럼! 당, 당연하지!", bg: "hiro4.jpg" },
  { name: "", text: "그리고 요정은 들릴 듯 말 듯한 목소리로 무언가를 중얼거렸다. 잘 들리지는 않았지만.", bg: "hiro4.jpg" },
  { name: "요정", text: "흐음... 이번에는 가시 덩굴 미로인가... 저번보다 쉽지 않을 것 같은 거 같은데...", bg: "hiro4.jpg" },
  { name: "요정", text: "뭐, 어떻게든 되겠지!", bg: "hiro4.jpg" },
  { name: "요정", text: "우리는 지금 마법사의 성으로 가고 있는 거야.", bg: "hiro4.jpg" },
  { name: "히로", text: "마법사의 성?", bg: "hiro4.jpg" },
  { name: "요정", text: "응! 네가 원래 세계로 돌아가려면 마법사가 열어주는 포탈을 타야 해.", bg: "hiro4.jpg" },
  { name: "히로", text: "정말 마법사를 만나면 돌아갈 수 있는거지? 빨리 가고 싶어...", bg: "hiro4.jpg" },
  { name: "요정", text: "빨리 가고 싶은 마음은 이해하지만... 가시에 찔리면 정말 아플거야. 조심해서 가자...", bg: "hiro4.jpg" },
  { name: "요정", text: "아직 해가 높이 떠 있으니 시간은... 지금은 괜찮을 거야. 해가 지기 전에 가야 하거든.", bg: "hiro4.jpg" },
  { name: "히로", text: "그치만 엄마가 내가 없어진 걸 알면 걱정하실거야.", bg: "hiro4.jpg" },
  { name: "요정", text: "해가 지기 전에만 도착하면 괜찮을 거야. 이곳의 시간은 네 세계보다 엄청 빠르게 흐르니까.", bg: "hiro4.jpg" },
  { name: "히로", text: "그렇구나... 알겠어. 그럼 조심히, 그래도 조금은 빠르게 가볼까.", bg: "hiro4.jpg" }
];

let dialogues2 = [
  { name: "히로", text: "겨우 빠져나왔잖아... 너무 힘들어... 넘어져서 까진 곳도 아프고... 집에 가고 싶어...", bg: "hiro5.jpg" },
  { name: "요정", text: "힘들겠지만 네가 겪는 모든 건 집으로 갈 수 있는 중요한 힘이 될 거야. 그러니까 조금만 더 열심히 가보자. 응?", bg: "hiro5.jpg" },
  { name: "히로", text: "그래, 알겠어. 집에 가려면 어쩔 수 없지...", bg: "hiro5.jpg" },
  { name: "히로", text: "이제 어디로 가야돼?", bg: "hiro5.jpg" },
  { name: "요정", text: "아까보다 기운을 차린 것 같아서 다행이네.", bg: "hiro5.jpg" },
  { name: "히로", text: "이쪽이야!", bg: "hiro5.jpg" },
  { name: "", text: "요정이 말해준 성으로 향하는 길목에는 거대하고 어두운 동굴이 떡하니 자리하고 있었다.", bg: "hiro6.jpg" },
  { name: "요정", text: "마법사의 성에 들어가려면 열쇠가 필요해. 그리고 그 열쇠는 동굴 끝에 있는 보물상자를 찾으면 나올거야.", bg: "hiro7.jpg" },
  { name: "요정", text: "그런데... 여기는 아까 미로보다 위험할 수도 있어. 큰 바위도 있고, 천장에서는 돌이 떨어지기도 해. 흡혈 박쥐도 있어. 훨씬 힘들거야.", bg: "hiro7.jpg" },
  { name: "요정", text: "히로야, 그런데도 너는 집을 가기 위해 위험한 것들을 모두 겪고, 참고, 이겨낼 수 있겠어? 정 못하겠다면... 이곳에서 정착하는 방법도 있거든.", bg: "hiro7.jpg" },
  { name: "요정", text: "여기는 필요한 건 뭐든 있고, 정착한 사람들이 불편하지 않도록 모든 것들을 지원해줄 거야.", bg: "hiro7.jpg" },
  { name: "요정", text: "그리고 또, 코하쿠 마을에서는,", bg: "hiro7.jpg" },
  { name: "히로", text: "고마워. 그리고 미안. 나는 집에 갈 거야. 무슨 일이 있어도. 그건 포기 못, 아니, 안 할거야.", bg: "hiro7.jpg" },
  { name: "히로", text: "그 길고 힘들었던 미로도 헤쳐나왔는걸? 잘 할 수 있는 것 같은 느낌이 들어.", bg: "hiro7.jpg" },
  { name: "요정", text: "하하, 좋아! 그러면 나도 무슨 일이 있어도 네가 지븡로 돌아갈 수 있도록 도와줄게. 이제 더 집중해야 한다?", bg: "hiro7.jpg" },
  { name: "요정", text: "그러면 이제 들어가자!", bg: "hiro7.jpg" },
];

let dialogues3 = [
  { name: "히로", text: "하아... 하아... 정말 위험했어. 그래도... 황금 열쇠를 구했어! 이제 집에 갈 수 있는 거겠지?!", bg: "hiro8.jpg" },
  { name: "요정", text: "와아! 대단해, 히로야!", bg: "hiro8.jpg" },
  { name: "요정", text: "저쪽에 보이는 게 마법사 코하쿠의 성이야!", bg: "hiro9.jpg" },
    { name: "요정", text: "이제 저쪽으로 가면...", bg: "hiro9.jpg" },
      { name: "요정", text: "어?!", bg: "hiro9.jpg" },
  { name: "히로", text: "왜 그래...? 뭐가 잘못된 거야?", bg: "hiro9.jpg" },
  { name: "요정", text: "마법사의 성은 해가 완전히 지면 열리지 않아!", bg: "hiro9.jpg" },
  { name: "요정", text: "우리 이제 최대한 빠르게 달려가야 할 것 같아. 뛰어가야 해!", bg: "hiro9.jpg" },
  { name: "요정", text: "내가 옆에서 길을 안내해줄게. 최대한 빠르게 가자!", bg: "hiro9.jpg" },
    { name: "히로", text: "후우... 알겠어. 가자!", bg: "hiro9.jpg" },
];

// 세 번째 미니게임(숲속 길) 이후의 마무리 스토리
let dialogues4 = [
  { name: "히로", text: "드디어... 드디어 마법사의 성에 도착했어!", bg: "hiro10.jpg" },
  { name: "요정", text: "후우... 수고했어, 히로야", bg: "hiro10.jpg" },
   { name: "요정", text: "이제 열쇠로 문을 열면 돼.", bg: "hiro10.jpg" },
   { name: "", text: "열쇠를 넣고 돌리자 성의 문이 열렸다.", bg: "hiro11.jpg" },
     { name: "히로", text: "들어가자!", bg: "hiro11.jpg" },
     { name: "", text: "마법사의 성으로 들어오자 보인 것은 텅 빈 성 뿐이었다.", bg: "hiro12.jpg" },
     { name: "히로", text: "어... 이제 어디로 가야 하지? 요정아, 이제 어떻게 해야 해?", bg: "hiro12.jpg" },
     { name: "요정", text: "히로야, 지금까지 어땠어?", bg: "hiro12.jpg" },
       { name: "히로", text: "어? 그게 무슨 소리야...?", bg: "hiro12.jpg" },
  { name: "요정", text: "히로야, 지금까지 어땠어?", bg: "hiro12.jpg" },
  { name: "히로", text: "으응...?", bg: "hiro12.jpg" },
  { name: "요정", text: "지금까지 미로를 지나고, 동굴을 거쳐서 마법사의 성까지 오는 과정이 너한테는 어땠어?", bg: "hiro12.jpg" },
 { name: "히로", text: "힘들었지...", bg: "hiro12.jpg" },
   { name: "요정", text: "그리고?", bg: "hiro12.jpg" },
   { name: "히로", text: "처음에는 너무 막막했지만... 너도 있고, 나도... 미로를 헤쳐나가면서 뭔가 할 수 있겠다는 느낌이 들었어.", bg: "hiro12.jpg" },
   { name: "요정", text: "그렇지? 지금 기분은 어때?", bg: "hiro12.jpg" },
   { name: "히로", text: "힘들었지만, 재미있었던 것 같아! 이제 집에 갈 수 있기도 하고, 또 너도 만났으니까.", bg: "hiro12.jpg" },
     { name: "요정", text: "다행이다.", bg: "hiro12.jpg" },
     { name: "", text: "요정이 그렇게 말하며 미소지었다.", bg: "hiro12.jpg" },
       { name: "", text: "그리고는 요술봉을 휘둘렀다. 그러자 신기한 빛이 나를 감싸고, 또 벽으로 향했다.", bg: "hiro12.jpg" },
  { name: "요정", text: "여기는 그냥 다른 세계가 아니야. 마음에 용기가 없는 아이들을 위해 태어난 새로운 차원같은 곳이거든.", bg: "hiro13.jpg" },
    { name: "요정", text: "너에게 용기가 생기고, 뿌듯함을 느끼고, 또 앞으로 해나갈 수 있다는 감정이 생기면 자연스럽게 원래 세계로 돌아가는 문이 열리게 돼.", bg: "hiro13.jpg" },
    { name: "요정", text: "마치 옆에 이렇게 생긴 문처럼!", bg: "hiro13.jpg" },
    { name: "요정", text: "이제 우리는 다시 볼 수 없겠지만, 오늘 우리가 함께한 모든 것들은 네 기억 속에서 용기의 뒷받침이자 자신감의 근거가 되어줄 거야.", bg: "hiro13.jpg" },
    { name: "요정", text: "앞으로 잘 지내야 해! 잘가!", bg: "hiro13.jpg" },
   { name: "히로", text: "응, 고마워! 너도 잘 지내!", bg: "hiro13.jpg" },
  { name: "", text: "포탈로 들어가보니, 나는 내 침대에서 정신을 차렸다.", bg: "hiro14.jpg" },
   { name: "", text: "어쩐지 오늘은 더 편안한 마음으로 잠에 들 수 있을 것 같았다.", bg: "hiro14.jpg" },
  
 
];

let currentIdx = 0;
let charIdx = 0;
let isTyping = true;
let typeSpeed = 4;
let isWaitingForText = false;

// =====================================
// 미니게임 1: 가시 덩굴 미로 변수들
// =====================================
let tile = 40;
let cols;
let rows;
let maze = [];
let wallData = [];
let mazePlayer;
let exitCell;
let minigameState = "intro";
let bloodDrops = [];
let fairyAngle = 0;
let puddles = [];
let minigameData = {};
let moveCooldown = 0;

// =====================================
// 미니게임 2: 동굴 달리기 게임 변수들
// =====================================
let cavePlayer;
let caveFairy;
let obstacles = [];
let treasureChest = null;
let magicKey = null;
let caveGameOver = false;
let score = 0;
let groundY;

let fairyMsg = "";
let fairyMsgStart = 0;
let fairyMsgDuration = 0;

let shownStartMsg = false;
let shownScore13Msg = false;
let shownScore20Msg = false;

let introStartTime = 0;
let dialogueStartTime = 0;
let stageClearStartTime = 0;
let clearAlpha = 0;

// =====================================
// 미니게임 3: 숲속 길 달리기 변수들 (forest 접두사로 충돌 방지)
// =====================================
let forestMusic;
let forestStarted = false;
let forestGameOver = false;
let forestCleared = false;
let forestSpeed = 4;
let forestScore = 0;
let forestPlayer;
let forestPath = [];
let forestCorners = [];
let forestTrees = [];
let forestClearCount = 0;
let forestFairyMsg = "";
let forestFairyTimer = 0;
let forestTargetVolume = 1;

const ROAD_WIDTH = 50;
const SEGMENT = 120;
const TURN_RADIUS = 35;

// 크레딧 페이드 타이밍
let creditStartTime = 0;

// =====================================
// SETUP & PRELOAD
// =====================================
function preload() {
  let allDialogues = dialogues1.concat(dialogues2).concat(dialogues3).concat(dialogues4);
  for (let i = 0; i < allDialogues.length; i++) {
    let bgName = allDialogues[i].bg;
    if (bgName !== "" && !bgImages[bgName]) {
      bgImages[bgName] = loadImage(bgName);
    }
  }
  if (!bgImages["first.jpg"]) bgImages["first.jpg"] = loadImage("first.jpg");
  if (!bgImages["hiro9.jpg"]) bgImages["hiro9.jpg"] = loadImage("hiro9.jpg");

  // 음악 (p5.sound 미탑재 환경에서도 에러 없이 동작)
  if (typeof loadSound === 'function') {
    soundFormats("mp3");
    forestMusic = loadSound("music.mp3");
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Georgia, "Malgun Gothic", serif');
  initGame();        // 미로 초기화
  initCaveGame();    // 동굴 초기화
  resetForestGame(); // 숲속 길 초기화
}

// =====================================
// DRAW (메인 게임 루프)
// =====================================
function draw() {
  if (gameState === "TITLE") {
    drawTitle();
  } else if (gameState === "STORY_1") {
    drawStory(dialogues1);
  } else if (gameState === "MINIGAME_MAZE") {
    drawMinigameMaze();
  } else if (gameState === "STORY_2") {
    drawStory(dialogues2);
  } else if (gameState === "MINIGAME_CAVE_START") {
    drawStartScreen();
  } else if (gameState === "MINIGAME_CAVE_INTRO") {
    drawCaveCoreBackground();
    cavePlayer.move(0);
    cavePlayer.update();
    cavePlayer.show();
    caveFairy.update();
    caveFairy.show();
    drawIntroScreen();
  } else if (
    gameState === "MINIGAME_CAVE_PLAYING" ||
    gameState === "MINIGAME_CAVE_CHEST" ||
    gameState === "MINIGAME_CAVE_KEY" ||
    gameState === "MINIGAME_CAVE_DIALOGUE"
  ) {
    drawCaveCoreBackground();

    if (caveGameOver) {
      cavePlayer.show();
      drawMessage("GAME OVER", color(255, 50, 50));
      return;
    }

    if (gameState !== "MINIGAME_CAVE_INTRO") {
      if (keyIsDown(65) || keyIsDown(97)) cavePlayer.move(-1);
      else if (keyIsDown(68) || keyIsDown(100)) cavePlayer.move(1);
      else cavePlayer.move(0);
      cavePlayer.update();
    }

    cavePlayer.show();
    caveFairy.update();
    caveFairy.show();

    if (gameState === "MINIGAME_CAVE_PLAYING") {
      updatePlayingMode();
    } else {
      updateStoryMode();
    }

    drawTimedFairyMsg();
    drawUI();
  } else if (gameState === "MINIGAME_CAVE_CLEAR") {
    drawCaveCoreBackground();
    cavePlayer.show();
    caveFairy.update();
    caveFairy.show();
    drawStageClear();
  } else if (gameState === "STORY_3") {
    drawStory(dialogues3);
  } else if (gameState === "MINIGAME_FOREST") {
    drawMinigameForest();
  } else if (gameState === "STORY_4") {
    drawStory(dialogues4);
  } else if (gameState === "CREDITS") {
    drawCredits();
  }
}

// =====================================
// 타이틀 화면 (first.jpg)
// =====================================
function drawTitle() {
  if (bgImages["first.jpg"]) {
    image(bgImages["first.jpg"], 0, 0, width, height);
  } else {
    background(18, 40, 18);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(60);
    text("히로의 모험", width / 2, height / 2);
  }
  let a = sin(frameCount * 0.08) * 100 + 155;
  fill(255, 255, 255, a);
  textAlign(CENTER, CENTER);
  textSize(40);
  textStyle(BOLD);
  text("화면을 클릭하여 시작하세요", width / 2, height - 90);
  textStyle(NORMAL);
}

// =====================================
// 엔딩 크레딧 화면
// =====================================
function drawCredits() {
  background(12, 16, 30);
  if (bgImages["hiro9.jpg"]) {
    image(bgImages["hiro9.jpg"], 0, 0, width, height);
    fill(0, 0, 0, 190);
    rect(0, 0, width, height);
  }

  // 반짝이는 별
  for (let i = 0; i < 50; i++) {
    let px = noise(i * 100 + frameCount * 0.004) * width;
    let py = noise(i * 200 + frameCount * 0.006) * height;
    let sz = noise(i * 300) * 4 + 2;
    let tw = sin(frameCount * 0.08 + i) * 60 + 180;
    fill(255, 235, 170, tw);
    noStroke();
    circle(px, py, sz);
  }

  let a = constrain(map(millis() - creditStartTime, 0, 1500, 0, 255), 0, 255);
  textAlign(CENTER, CENTER);

  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = 'rgba(255, 210, 120, 0.7)';
  fill(255, 245, 225, a);
  textSize(42);
  textStyle(BOLD);
  text("게임을 플레이해주셔서 감사합니다.", width / 2, height / 2 - 90);
  drawingContext.shadowBlur = 0;

  textStyle(NORMAL);
  fill(255, 230, 200, a);
  textSize(30);
  text("당신의 앞날도 언제나 어떠한 종료의 용기가 가득하길.", width / 2, height / 2 - 20);

  let a2 = constrain(map(millis() - creditStartTime, 1200, 2700, 0, 255), 0, 255);
  fill(205, 212, 235, a2);
  textSize(20);
  text("문예창작학과 김서연      경영학부 안채민      글로벌미디어학부 임한솔", width / 2, height / 2 + 80);
}

// =====================================
// 스토리 렌더링 시스템
// =====================================
function drawStory(currentDialogues) {
  if (currentIdx < currentDialogues.length) {
    let currentBgName = currentDialogues[currentIdx].bg;
    if (currentBgName && bgImages[currentBgName]) {
      image(bgImages[currentBgName], 0, 0, width, height);
    }
  } else {
    let lastBgName = currentDialogues[currentDialogues.length - 1].bg;
    if (lastBgName && bgImages[lastBgName]) {
      image(bgImages[lastBgName], 0, 0, width, height);
    }

    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    fill(255);
    textSize(50);
    textAlign(CENTER, CENTER);
    if (gameState === "STORY_1") {
      text("대사 끝! 마우스를 클릭하여 코하쿠의 정원 미로로 진입하세요.", width / 2, height / 2);
    } else if (gameState === "STORY_2") {
      text("대사 끝! 마우스를 클릭하여 어둠의 동굴로 진입하세요.", width / 2, height / 2);
    } else if (gameState === "STORY_3") {
      text("대사 끝! 마우스를 클릭하여 마법사의 성으로 향하는 숲길로 진입하세요.", width / 2, height / 2);
    } else {
      text("모든 이야기가 끝났습니다. 플레이해주셔서 감사합니다!", width / 2, height / 2);
    }
    return;
  }

  if (!isWaitingForText) {
    let currentDialog = currentDialogues[currentIdx];

    if (currentDialog.name !== "") {
      drawNameBox(currentDialog.name);
    }
    drawDialogueBox();

    if (isTyping && frameCount % typeSpeed === 0) {
      charIdx++;
      if (charIdx >= currentDialog.text.length) {
        isTyping = false;
      }
    }

    let displayedText = currentDialog.text.substring(0, charIdx);

    let boxW = width * 0.8;
    let boxH = height * 0.3;
    if (boxH < 250) boxH = 250;
    let boxX = width * 0.1;
    let boxY = height - boxH - 30;

    textAlign(LEFT, TOP);

    let 스토리글자크기 = 60;
    textSize(스토리글자크기);
    textLeading(스토리글자크기 * 1.3);

    fill(0, 0, 0, 150);
    textSize(스토리글자크기);
    text(displayedText, boxX + 45, boxY + 55, boxW - 90, boxH - 90);

    if (currentDialog.name === "") {
      fill(200, 210, 220);
    } else {
      fill(255, 245, 235);
    }
    textSize(스토리글자크기);
    text(displayedText, boxX + 40, boxY + 50, boxW - 80, boxH - 80);
  }
}

function drawDialogueBox() {
  let boxW = width * 0.8;
  let boxH = height * 0.3;
  if (boxH < 250) boxH = 250;
  let boxX = width * 0.1;
  let boxY = height - boxH - 30;

  stroke(180, 160, 110, 220);
  strokeWeight(5);
  fill(35, 30, 25, 230);
  rect(boxX, boxY, boxW, boxH, 20);

  stroke(255, 255, 255, 40);
  strokeWeight(2);
  noFill();
  rect(boxX + 12, boxY + 12, boxW - 24, boxH - 24, 15);
}

function drawNameBox(name) {
  let boxH = height * 0.3;
  if (boxH < 250) boxH = 250;
  let boxY = height - boxH - 30;
  let nameBoxY = boxY - 75;
  let boxX = width * 0.1;

  stroke(180, 160, 110, 220);
  strokeWeight(4);

  if (name === "요정") fill(255, 240, 160, 240);
  else fill(45, 60, 50, 230);

  rect(boxX, nameBoxY, 220, 75, 15, 15, 0, 0);
  noStroke();

  if (name === "요정") fill(40, 30, 20);
  else fill(250, 245, 235);

  textSize(40);
  textAlign(CENTER, CENTER);
  text(name, boxX + 110, nameBoxY + 35);
}

// =====================================
// 마우스 클릭 이벤트 관리
// =====================================
function mousePressed() {
  if (!enteredFullscreen) {
    let fs = fullscreen();
    fullscreen(!fs);
    enteredFullscreen = true;
  }

  if (gameState === "TITLE") {
    gameState = "STORY_1";
    currentIdx = 0;
    charIdx = 0;
    isTyping = true;
    isWaitingForText = false;
  } else if (gameState === "STORY_1") {
    handleStoryClick(dialogues1);
  } else if (gameState === "MINIGAME_MAZE") {
    if (minigameState === "clear") {
      gameState = "STORY_2";
      currentIdx = 0;
      charIdx = 0;
      isTyping = true;
      isWaitingForText = false;
    }
  } else if (gameState === "STORY_2") {
    handleStoryClick(dialogues2);
  } else if (gameState === "MINIGAME_CAVE_START") {
    gameState = "MINIGAME_CAVE_INTRO";
    introStartTime = millis();
  } else if (gameState === "MINIGAME_CAVE_CLEAR") {
    gameState = "STORY_3";
    currentIdx = 0;
    charIdx = 0;
    isTyping = true;
    isWaitingForText = false;
  } else if (gameState === "STORY_3") {
    handleStoryClick(dialogues3);
  } else if (gameState === "MINIGAME_FOREST") {
    handleForestClick();
  } else if (gameState === "STORY_4") {
    handleStoryClick(dialogues4);
  }
  // CREDITS: 클릭해도 종료 화면 유지
}

function handleStoryClick(currentDialogues) {
  if (currentIdx < currentDialogues.length) {
    if (isWaitingForText) {
      isWaitingForText = false;
      charIdx = 0;
      isTyping = true;
    } else if (isTyping) {
      charIdx = currentDialogues[currentIdx].text.length;
      isTyping = false;
    } else {
      let prevBgName = currentDialogues[currentIdx].bg;
      currentIdx++;

      if (currentIdx < currentDialogues.length) {
        let nextBgName = currentDialogues[currentIdx].bg;
        if (prevBgName !== nextBgName) {
          isWaitingForText = true;
        } else {
          charIdx = 0;
          isTyping = true;
        }
      } else {
        if (gameState === "STORY_1") {
          gameState = "MINIGAME_MAZE";
          minigameState = "intro";
          setTimeout(() => { minigameState = "game"; }, 2200);
        } else if (gameState === "STORY_2") {
          gameState = "MINIGAME_CAVE_START";
          initCaveGame();
        } else if (gameState === "STORY_3") {
          gameState = "MINIGAME_FOREST";
          forestStarted = false;
          resetForestGame();
        } else if (gameState === "STORY_4") {
          gameState = "CREDITS";
          creditStartTime = millis();
        }
      }
    }
  }
}

// =====================================
// 미니게임 1: 가시 덩굴 미로 구동 시스템
// =====================================

function drawMinigameMaze() {
  if (minigameState === "gameover") {
    background(30, 0, 0);
    fill(130, 0, 0, 120);
    rect(0, 0, width, height);

    for (let b of bloodDrops) {
      fill(170, 0, 0);
      noStroke();
      ellipse(b.x, b.y, b.size, b.size);
      triangle(b.x - b.size / 2, b.y, b.x + b.size / 2, b.y, b.x, b.y - b.size * 1.5);

      b.y += b.speed;
      if (b.y > height + 80) {
        b.y = random(-300, 0);
        b.x = random(width);
      }
    }

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(100);
    text("GAME OVER", width / 2, height / 2 - 60);
    textSize(40);
    text("R버튼을 눌러 다시 시작하기", width / 2, height / 2 + 50);
    return;
  }

  if (minigameState === "clear") {
    background(28, 95, 28);
    drawMaze();
    drawGardenDome();
    drawMazePlayer();
    drawMazeFairy();

    fill(10, 30, 10, 190);
    rect(0, 0, width, height);

    drawFairySpeechBubble();

    fill(100, 255, 170);
    textAlign(CENTER, CENTER);
    textSize(120);
    text("GAME CLEAR", width / 2, height / 2 - 70);
    textSize(45);
    fill(255);
    text("마우스를 눌러 다음 스토리로 이동해주세요.", width / 2, height / 2 + 60);
    return;
  }
  background(28, 95, 28);
  drawMaze();
  drawGardenDome();

  if (minigameState === "game") {
    moveMazePlayer();
  }
  drawMazePlayer();
  drawMazeFairy();

  if (minigameState === "minigame") {
    handleMazeMinigame();
  }
}

let tile; // ✅ tile 전역으로 선언 (중요)

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGame();
}

function initGame() {
  // ✅ 셀 개수 기준으로 먼저 설정 (비율 유지 핵심)
  cols = 41;
  rows = 25;

  // ✅ 화면에 맞게 tile 자동 계산
tile = floor(min(width / cols, height / rows));

  // ✅ 다시 cols/rows 보정 (홀수 유지)
  cols = floor(width / tile);
  rows = floor(height / tile);

  if (cols % 2 === 0) cols--;
  if (rows % 2 === 0) rows--;

  maze = [];
  wallData = [];

  for (let y = 0; y < rows; y++) {
    maze[y] = [];
    wallData[y] = [];
    for (let x = 0; x < cols; x++) {
      maze[y][x] = 1;
      wallData[y][x] = createWallData();
    }
  }

  carve(1, 1);
  maze[1][1] = 0;

  exitCell = null;
  for (let x = cols - 2; x > 1; x--) {
    if (maze[rows - 2][x] === 0) {
      exitCell = { x: x, y: rows - 2 };
      break;
    }
  }

  if (!exitCell) {
    maze[rows - 2][cols - 2] = 0;
    maze[rows - 2][cols - 3] = 0;
    exitCell = { x: cols - 2, y: rows - 2 };
  }

  mazePlayer = {
    x: tile + tile / 2,
    y: tile + tile / 2
  };

  bloodDrops = [];
  moveCooldown = 0;
  generatePuddles();
}
function generatePuddles() {
  puddles = [];
  let emptyCells = [];
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      if (maze[y][x] === 0) {
        if (dist(x, y, 1, 1) > 3 && dist(x, y, exitCell.x, exitCell.y) > 3) {
          emptyCells.push({ x: x, y: y });
        }
      }
    }
  }
  shuffle(emptyCells, true);
  let numPuddles = min(15, emptyCells.length);
  for (let i = 0; i < numPuddles; i++) {
    puddles.push(emptyCells[i]);
  }
}

function createWallData() {
  let vines = [];
  let thorns = [];
  for (let i = 0; i < 2; i++) {
    vines.push({ sx: random(3, tile - 3), c1x: random(-3, 3), c2x: random(-3, 3) });
  }
  for (let i = 0; i < 3; i++) {
    thorns.push({ bx: random(4, tile - 4), by: random(4, tile - 4), w: random(3, 6), h: random(4, 7) });
  }
  return { vines: vines, thorns: thorns };
}

function drawFairySpeechBubble() {
  let fx = mazePlayer.x + 12 + sin(fairyAngle) * 3;
  let fy = mazePlayer.y - 6 + cos(fairyAngle) * 4;
  let msg = "히로야 드디어 코하쿠의\n정원을 탈출했어!";
  let bx = fx - 95;
  let by = fy - 50;
  push();
  fill(255);
  stroke(255, 220, 100);
  strokeWeight(3);
  triangle(fx - 4, fy - 4, bx + 25, by + 28, bx + 45, by + 28);
  rectMode(CENTER);
  rect(bx, by, 180, 60, 15);
  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(15);
  textStyle(BOLD);
  text(msg, bx, by);
  pop();
}

function handleMazeMinigame() {
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);
  drawSpeechBubble(mazePlayer.x, mazePlayer.y);
  let elapsed = millis() - minigameData.startTime;
  let timeLeft = 10 - Math.floor(elapsed / 1000);
  textAlign(CENTER, CENTER);
  fill(255, 100, 100);
  textSize(35);
  text(`앗, 숨겨진 웅덩이에 빠졌습니다!`, width / 2, height / 2 - 70);
  fill(255);
  textSize(45);
  text(`남은 시간: ${timeLeft}초`, width / 2, height / 2 - 10);
  fill(255, 255, 100);
  textSize(60);
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = "yellow";
  text(`[ ${minigameData.keyName} ] 키 연타! (${minigameData.count} / 20)`, width / 2, height / 2 + 70);
  drawingContext.shadowBlur = 0;
  if (timeLeft <= 0) {
    createBlood();
    minigameState = "gameover";
  }
}

function drawSpeechBubble(x, y) {
  let msg = "으악!\n웅덩이에\n넘어졌다!";
  let bx = x;
  let by = y - 45;
  push();
  fill(255);
  stroke(0);
  strokeWeight(2);
  triangle(x, y - 15, x - 8, y - 30, x + 8, y - 30);
  rectMode(CENTER);
  rect(bx, by - 25, 110, 70, 12);
  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(14);
  textStyle(BOLD);
  text(msg, bx, by - 25);
  pop();
}

function carve(startX, startY) {
  let stack = [{ x: startX, y: startY }];
  maze[startY][startX] = 0;

  while (stack.length > 0) {
    let current = stack[stack.length - 1];
    let dirs = [[2, 0], [-2, 0], [0, 2], [0, -2]];
    shuffle(dirs, true); 

    let carved = false;
    for (let d of dirs) {
      let nx = current.x + d[0];
      let ny = current.y + d[1];

      // 다음 타일이 범위 안이고 아직 벽(1)이라면 길을 뚫음
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && maze[ny][nx] === 1) {
        maze[ny][nx] = 0; 
        maze[current.y + d[1] / 2][current.x + d[0] / 2] = 0; 
        
        stack.push({ x: nx, y: ny });
        carved = true;
        break; 
      }
    }
    
    // 더 이상 뚫을 곳이 없으면 뒤로 한 칸 돌아감
    if (!carved) {
      stack.pop();
    }
  }
}

function drawMaze() {
  fill(145, 110, 75);
  noStroke();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 0) {
        let cx = x * tile + tile / 2;
        let cy = y * tile + tile / 2;
        ellipse(cx, cy, tile, tile);
        if (x < cols - 1 && maze[y][x+1] === 0) {
          rect(cx, cy - tile / 2, tile + 1, tile);
        }
        if (y < rows - 1 && maze[y+1][x] === 0) {
          rect(cx - tile / 2, cy, tile, tile + 1);
        }
      }
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1) {
        let px = x * tile;
        let py = y * tile;
        let data = wallData[y][x];
        stroke(65, 40, 15);
        strokeWeight(1.5);
        for (let v of data.vines) {
          beginShape();
          vertex(px + v.sx, py + tile);
          bezierVertex(px + v.sx + v.c1x, py + 18, px + v.sx + v.c2x, py + 8, px + v.sx, py);
          endShape();
        }
        noStroke();
        fill(245);
        for (let t of data.thorns) {
          let tx = px + t.bx;
          let ty = py + t.by;
          triangle(tx, ty - t.h, tx - t.w / 2, ty, tx + t.w / 2, ty);
        }
      }
    }
  }
}

function drawGardenDome() {
  if (!exitCell) return;
  let cx = exitCell.x * tile + tile / 2;
  let cy = exitCell.y * tile + tile / 2;
  noStroke();
  fill(34, 139, 34);
  stroke(15, 70, 15);
  strokeWeight(2.5);
  arc(cx, cy + tile/4, tile + 12, tile + 16, PI, 0);
  noStroke();
  fill(50, 205, 50);
  circle(cx - tile/3, cy - tile/5, 14);
  circle(cx + tile/3, cy - tile/5, 14);
  circle(cx, cy - tile/2, 18);
  circle(cx - tile/5, cy - tile/3, 16);
  circle(cx + tile/5, cy - tile/3, 16);
  circle(cx - tile/4, cy, 12);
  circle(cx + tile/4, cy, 12);
  circle(cx, cy - tile/8, 15);
  fill(255, 215, 0);
  circle(cx - tile/2.5, cy - tile/10, 4);
  circle(cx + tile/2.5, cy - tile/10, 4);
  circle(cx - tile/4, cy - tile/2.5, 5);
  circle(cx + tile/4, cy - tile/2.5, 5);
  circle(cx, cy - tile/2.5, 6);
  circle(cx - tile/8, cy + tile/8, 4.5);
  circle(cx + tile/8, cy + tile/8, 4.5);
}

function moveMazePlayer() {
  if (millis() < moveCooldown) return;
  let speed = 7;
  let nx = mazePlayer.x;
  let ny = mazePlayer.y;
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) ny -= speed;
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) ny += speed;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) nx -= speed;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) nx += speed;

  let hitbox = { left: nx - 5, right: nx + 5, top: ny - 10, bottom: ny + 11 };
  let left = floor(hitbox.left / tile);
  let right = floor(hitbox.right / tile);
  let top = floor(hitbox.top / tile);
  let bottom = floor(hitbox.bottom / tile);

  if (
    top >= 0 && bottom < rows && left >= 0 && right < cols &&
    maze[top][left] === 0 && maze[top][right] === 0 &&
    maze[bottom][left] === 0 && maze[bottom][right] === 0
  ) {
    mazePlayer.x = nx;
    mazePlayer.y = ny;
    let gx = floor(nx / tile);
    let gy = floor(ny / tile);
    if (exitCell && gx === exitCell.x && gy === exitCell.y) {
      minigameState = "clear";
    }
    for (let i = puddles.length - 1; i >= 0; i--) {
      if (puddles[i].x === gx && puddles[i].y === gy) {
        minigameState = "minigame";
        let keys = ['w', 'a', 's', 'd'];
        let chosen = random(keys);
        minigameData = {
          keyToPress: chosen, keyName: chosen.toUpperCase(),
          count: 0, target: 20, startTime: millis()
        };
        puddles.splice(i, 1);
        break;
      }
    }
  } else {
    createBlood();
    minigameState = "gameover";
  }
}

function drawMazePlayer() {
  let x = mazePlayer.x; let y = mazePlayer.y;
  noStroke(); fill(139, 69, 19); rect(x - 6, y - 12, 12, 18, 4);
  fill(255, 220, 200); ellipse(x, y - 5, 9, 10);
  fill(120, 55, 10); rect(x - 4.5, y - 11, 9, 4, 1.5);
  fill(255, 170, 210); rect(x - 3.5, y + 1, 7, 10, 2);
}

function drawMazeFairy() {
  fairyAngle += 0.06;
  let fx = mazePlayer.x + 12 + sin(fairyAngle) * 3;
  let fy = mazePlayer.y - 6 + cos(fairyAngle) * 4;
  drawingContext.shadowBlur = 12; drawingContext.shadowColor = "yellow";
  fill(255, 255, 150); ellipse(fx, fy, 7);
  fill(255); ellipse(fx - 3, fy - 2, 3.5);
  drawingContext.shadowBlur = 0;
}

function createBlood() {
  bloodDrops = [];
  for (let i = 0; i < 30; i++) {
    bloodDrops.push({ x: random(width), y: random(-height, 0), speed: random(5, 12), size: random(10, 40) });
  }
}

// =====================================
// 미니게임 2: 동굴 달리기 구동 시스템
// =====================================
function initCaveGame() {
  groundY = height - 50;
  cavePlayer = new Player();
  caveFairy = new Fairy(cavePlayer);
  obstacles = [];
  treasureChest = null;
  magicKey = null;
  caveGameOver = false;
  score = 0;
  clearAlpha = 0;
  fairyMsg = "";
  shownStartMsg = false;
  shownScore13Msg = false;
  shownScore20Msg = false;
}

function drawCaveCoreBackground() {
  background(25, 20, 30);
  fill(10);
  noStroke();
  rect(0, 0, width, 40);
  rect(0, groundY, width, 50);
}

function drawStartScreen() {
  drawCaveCoreBackground();
  cavePlayer.show();
  caveFairy.show();

  fill(0, 0, 0, 160);
  rect(0, 0, width, height);

  fill(255, 215, 0);
  textAlign(CENTER, CENTER);
  textSize(70);
  textStyle(BOLD);
  text("장애물을 피해 마법사 성의 열쇠를 얻자!", width / 2, height / 2 - 40);

  let blinkAlpha = sin(frameCount * 0.1) * 100 + 155;
  fill(255, 255, 255, blinkAlpha);
  textSize(28);
  textStyle(NORMAL);
  text("화면을 마우스로 클릭하여 시작하세요", width / 2, height / 2 + 50);
}

function drawIntroScreen() {
  let elapsed = millis() - introStartTime;
  let left = ceil(10 - (elapsed / 1000));
  if (left < 1) left = 1;

  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(45);
  textStyle(BOLD);
  text("다가오는 장애물을 피하세요. 동굴의 끝까지 가면 열쇠를 획득할 수 있습니다.", width / 2, height / 2 - 100);
  textStyle(NORMAL);

  textSize(90);
  fill(255, 215, 0);
  text(left, width / 2, height / 2 + 10);

  textSize(18);
  fill(200, 200, 200);
  text("WASD 키를 활용해 좌우 이동 및 엎드리기/일어서기가 가능합니다.\n스페이스 바를 눌러 점프할 수 있습니다. 장애물들을 피해 열쇠를 획득해주세요.", width / 2, height / 2 + 120);

  push();
  let bx = caveFairy.x + 30;
  let by = caveFairy.y - 110;
  fill(255, 255, 255, 240);
  stroke(255, 200, 0);
  strokeWeight(2);
  rect(bx, by, 480, 80, 15);

  noStroke();
  fill(255, 255, 255, 240);
  triangle(bx + 20, by + 80, bx + 35, by + 80, bx + 28, by + 95);

  fill(0);
  textSize(20);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text("이 동굴 어딘가에 마법사가 숨긴 황금 열쇠가 숨겨져 있대.\n어서 찾으러 가자!", bx + 240, by + 40);
  pop();

  if (elapsed > 10000) {
    gameState = "MINIGAME_CAVE_PLAYING";
    showFairyMsg("위험한 게 많으니 조심해야해!", 2000);
    shownStartMsg = true;
  }
}

function showFairyMsg(msg, duration) {
  fairyMsg = msg;
  fairyMsgStart = millis();
  fairyMsgDuration = duration;
}

function drawTimedFairyMsg() {
  if (fairyMsg === "") return;
  if (millis() - fairyMsgStart > fairyMsgDuration) {
    fairyMsg = "";
    return;
  }

  let elapsed = millis() - fairyMsgStart;
  let alpha = 255;
  if (elapsed > fairyMsgDuration - 400) {
    alpha = map(elapsed, fairyMsgDuration - 400, fairyMsgDuration, 255, 0);
  }

  push();
  let bx = caveFairy.x + 25;
  let by = caveFairy.y - 70;
  let tw = textWidth(fairyMsg) * 1.1 + 40;
  if (tw < 280) tw = 280;

  fill(255, 255, 255, alpha * 0.9);
  stroke(255, 200, 0, alpha);
  strokeWeight(2);
  rect(bx, by, tw, 50, 10);

  noStroke();
  fill(255, 255, 255, alpha * 0.9);
  triangle(bx + 15, by + 50, bx + 25, by + 50, bx + 20, by + 60);

  fill(0, 0, 0, alpha);
  textSize(20);
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  text(fairyMsg, bx + tw / 2, by + 25);
  pop();
}

function updatePlayingMode() {
  if (score >= 13 && !shownScore13Msg) {
    showFairyMsg("거의 다 왔어! 힘내!", 2000);
    shownScore13Msg = true;
  }

  if (score >= 20) {
    if (obstacles.length === 0) {
      gameState = "MINIGAME_CAVE_CHEST";
      treasureChest = new TreasureChest();
      if (!shownScore20Msg) {
        showFairyMsg("보물상자다! 열쇠를 가지러 가자!", 2000);
        shownScore20Msg = true;
      }
    }
  } else {
    if (frameCount % 75 === 0) {
      let type = floor(random(3));
      if (type === 0) obstacles.push(new Stone());
      else if (type === 1) obstacles.push(new Stalactite());
      else obstacles.push(new Bat());
    }
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update();
    obstacles[i].show();
    if (obstacles[i].hits(cavePlayer)) caveGameOver = true;
    if (obstacles[i].offscreen()) {
      obstacles.splice(i, 1);
      score++;
    }
  }
}

function updateStoryMode() {
  if (treasureChest) {
    treasureChest.update();
    treasureChest.show();

    if (gameState === "MINIGAME_CAVE_CHEST" && treasureChest.hits(cavePlayer)) {
      treasureChest.open();
      magicKey = new MagicKey(treasureChest.x, treasureChest.y - 20);
      gameState = "MINIGAME_CAVE_KEY";
    }
  }

  if (magicKey) {
    magicKey.update();
    magicKey.show();

    if (gameState === "MINIGAME_CAVE_KEY" && magicKey.hits(cavePlayer)) {
      magicKey.collect();
      gameState = "MINIGAME_CAVE_DIALOGUE";
      dialogueStartTime = millis();
    }
  }

  if (gameState === "MINIGAME_CAVE_DIALOGUE") {
    drawFairyDialogue("좋아! 이제 마법사의 성으로 가자!");

    if (millis() - dialogueStartTime > 5000) {
      gameState = "MINIGAME_CAVE_CLEAR";
      clearAlpha = 0;
      stageClearStartTime = millis();
    }
  }
}

function drawStageClear() {
  if (clearAlpha < 255) clearAlpha += 3;
  let a = constrain(clearAlpha, 0, 255);

  fill(0, 0, 0, a * 0.85);
  rect(0, 0, width, height);

  for (let i = 0; i < 40; i++) {
    let px = noise(i * 100 + frameCount * 0.005) * width;
    let py = noise(i * 200 + frameCount * 0.008) * height;
    let sz = noise(i * 300 + frameCount * 0.01) * 6 + 2;
    let twinkle = sin(frameCount * 0.1 + i) * 60 + 195;
    fill(255, 215, 100, twinkle * (a / 255));
    noStroke();
    circle(px, py, sz);
  }

  let bounce = sin(frameCount * 0.06) * 8;
  textAlign(CENTER, CENTER);

  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = 'rgba(255, 200, 0, 0.8)';
  fill(255, 215, 0, a);
  textSize(90);
  textStyle(BOLD);
  text("Stage Clear!", width / 2, height / 2 - 60 + bounce);
  drawingContext.shadowBlur = 0;

  let subAlpha = constrain(map(clearAlpha, 100, 255, 0, 255), 0, 255);
  fill(230, 230, 255, subAlpha);
  textSize(28);
  textStyle(NORMAL);
  text("이제 마법사의 성으로 가자. 곧 집에 갈 수 있을거야!", width / 2, height / 2 + 40);

  let blinkAlpha = sin(frameCount * 0.08) * 80 + 175;
  fill(100, 255, 150, min(blinkAlpha, subAlpha));
  textSize(26);
  textStyle(BOLD);
  text("▶ 마우스를 클릭하여 다음 이야기로 이동하세요 ◀", width / 2, height / 2 + 110);
  textStyle(NORMAL);
}

function drawUI() {
  if (score >= 20 && gameState !== "MINIGAME_CAVE_DIALOGUE" && gameState !== "MINIGAME_CAVE_CLEAR" && gameState !== "STORY_3") {
    fill(255, 215, 0);
    textAlign(LEFT, TOP);
    textSize(24);
    text("보물 상자가 나타났어! 확인하러 가자!", 20, 55);
  }

  if (gameState.startsWith("MINIGAME_CAVE")) {
    fill(150, 150, 150, 150);
    textAlign(RIGHT, BOTTOM);
    textSize(16);
    textStyle(NORMAL);
    text("점프: Space  |  조작: W, A, S, D", width - 20, height - 15);
  }
}

function drawFairyDialogue(msg) {
  push();
  let bx = caveFairy.x + 25;
  let by = caveFairy.y - 70;

  fill(255, 255, 255, 230);
  stroke(255, 200, 0);
  strokeWeight(2);
  rect(bx, by, 320, 50, 10);

  noStroke();
  fill(255, 255, 255, 230);
  triangle(bx + 15, by + 50, bx + 25, by + 50, bx + 20, by + 60);

  fill(0);
  textSize(20);
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  text(msg, bx + 160, by + 25);
  pop();
}

function drawMessage(msg, col) {
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  fill(col);
  textSize(80);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(msg, width / 2, height / 2 - 20);
  textStyle(NORMAL);
  textSize(24);
  fill(255);
  text("Press 'R' to Restart", width / 2, height / 2 + 50);
}

function resetGame() {
  caveGameOver = false;
  score = 0;
  obstacles = [];
  treasureChest = null;
  magicKey = null;
  gameState = "MINIGAME_CAVE_PLAYING";
  clearAlpha = 0;
  dialogueStartTime = 0;
  stageClearStartTime = 0;
  fairyMsg = "";
  shownStartMsg = false;
  shownScore13Msg = false;
  shownScore20Msg = false;

  cavePlayer = new Player();
  caveFairy = new Fairy(cavePlayer);
  showFairyMsg("위험한 게 많으니 조심해야해!", 2000);
  shownStartMsg = true;
}

// =====================================
// 미니게임 3: 숲속 길 달리기 구동 시스템
// =====================================
function resetForestGame() {
  forestScore = 0;
  forestClearCount = 0;
  forestGameOver = false;
  forestCleared = false;
  forestTargetVolume = 1;
  forestFairyMsg = "";
  forestFairyTimer = 0;

  generateForestRoad();
  generateForestTrees();

  forestPlayer = {
    x: forestPath[0].x,
    y: forestPath[0].y,
    dir: forestPath[0].dir
  };
}

function generateForestRoad() {
  forestPath = [];
  forestCorners = [];

  let x = width / 2;
  let y = height + 800;
  let dir = 0; // 0 up, 1 right, 2 left

  forestPath.push({ x, y, dir });

  for (let i = 0; i < 40; i++) {
    let straight = floor(random(3, 6));
    for (let j = 0; j < straight; j++) {
      if (dir === 0) y -= SEGMENT;
      if (dir === 1) x += SEGMENT;
      if (dir === 2) x -= SEGMENT;
      forestPath.push({ x, y, dir });
    }

    let nextDir;
    if (dir === 0) {
      nextDir = random([1, 2]);
    } else {
      nextDir = 0;
    }

    forestCorners.push({ x, y, nextDir, used: false });
    dir = nextDir;
  }
}

function generateForestTrees() {
  forestTrees = [];
  for (let i = 0; i < 400; i++) {
    forestTrees.push({
      x: random(-2500, 2500),
      y: random(-7000, 1000),
      size: random(25, 60)
    });
  }
}

function drawMinigameForest() {
  background(120, 185, 120);

  // 음악 볼륨 부드럽게 조정
  if (forestMusic && forestMusic.getVolume) {
    let current = forestMusic.getVolume();
    current = lerp(current, forestTargetVolume, 0.02);
    forestMusic.setVolume(current);
  }

  // 시작 안내 화면
  if (!forestStarted) {
    background(120, 185, 120);
    for (let i = 0; i < 8; i++) {
      let tx = 100 + i * 150;
      fill(110, 70, 30);
      rect(tx - 5, 130, 10, 30);
      fill(40, 130, 40);
      circle(tx, 110, 50);
    }
    fill(255);
    textAlign(CENTER);
    textSize(48);
    text("숲속 길 달리기", width / 2, 80);

    fill(255);
    textSize(28);
    text("게임 방법", width / 2, 290);
    textSize(20);
    text("• 길이 꺾이는 지점에서 클릭하세요", width / 2, 340);
    text("• 길을 벗어나면 게임 오버입니다", width / 2, 380);
    text("• 코너를 놓치면 길 밖으로 나가게 됩니다", width / 2, 420);

    fill(255, 255, 120);
    textSize(30);
    text("클릭하여 시작", width / 2, height - 100);
    return;
  }

  if (!forestGameOver && !forestCleared) {
    moveForestPlayer();
    checkForestRoad();
    forestScore += 0.05;
  }

  push();
  translate(width / 2 - forestPlayer.x, height * 0.7 - forestPlayer.y);
  drawForestTrees();
  drawForestRoad();
  drawForestPlayer();
  drawForestFairyMessage();
  pop();

  if (forestGameOver) {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(50);
    text("GAME OVER", width / 2, height / 2);
    textSize(25);
    text("PRESS R", width / 2, height / 2 + 60);
  }

  if (forestCleared) {
    fill(0, 0, 0, 120);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(60);
    text("GAME CLEAR", width / 2, height / 2 - 30);
    textSize(28);
    fill(255, 255, 150);
    text("마우스를 클릭하여 다음 이야기로 이동하세요", width / 2, height / 2 + 50);
  }
}

function moveForestPlayer() {
  if (forestPlayer.dir === 0) forestPlayer.y -= forestSpeed;
  if (forestPlayer.dir === 1) forestPlayer.x += forestSpeed;
  if (forestPlayer.dir === 2) forestPlayer.x -= forestSpeed;
}

function drawForestRoad() {
  stroke(170, 120, 70);
  strokeWeight(ROAD_WIDTH);
  for (let i = 0; i < forestPath.length - 1; i++) {
    line(forestPath[i].x, forestPath[i].y, forestPath[i + 1].x, forestPath[i + 1].y);
  }
}

function drawForestPlayer() {
  push();
  translate(forestPlayer.x, forestPlayer.y);
  noStroke();

  // 요정 위치 흔들림
  let fairyY = sin(frameCount * 0.15) * 5;

  // 날개
  fill(220, 255, 255, 180);
  ellipse(22, -25 + fairyY, 10, 16);
  ellipse(32, -25 + fairyY, 10, 16);

  // 요정 몸
  fill(255, 255, 120);
  circle(27, -20 + fairyY, 10);

  // 반짝임
  fill(255, 255, 180, 150);
  circle(20, -35 + fairyY, 3);
  circle(35, -32 + fairyY, 3);
  circle(30, -40 + fairyY, 2);

  noStroke();
  // 그림자
  fill(0, 0, 0, 60);
  ellipse(0, 18, 22, 8);

  // 머리카락
  fill(90, 50, 20);
  ellipse(0, -12, 26, 32);

  // 얼굴
  fill(255, 220, 190);
  circle(0, -15, 18);

  // 앞머리
  fill(90, 50, 20);
  arc(0, -15, 20, 20, PI, TWO_PI);

  // 눈
  fill(0);
  circle(-3, -16, 2);
  circle(3, -16, 2);

  // 핑크 원피스
  rectMode(CENTER);
  fill(255, 120, 180);
  rect(0, 5, 20, 20, 4);
  pop();
}

function checkForestRoad() {
  let onRoad = false;
  for (let i = 0; i < forestPath.length - 1; i++) {
    let d = distToSegment(
      forestPlayer.x, forestPlayer.y,
      forestPath[i].x, forestPath[i].y,
      forestPath[i + 1].x, forestPath[i + 1].y
    );
    if (d <= ROAD_WIDTH / 2) {
      onRoad = true;
      break;
    }
  }
  if (!onRoad) {
    forestGameOver = true;
  }
}

function handleForestClick() {
  // 시작 전이면 게임 시작 + 음악 재생
  if (!forestStarted) {
    forestStarted = true;
    if (typeof userStartAudio === 'function') userStartAudio();
    if (forestMusic && forestMusic.loop) forestMusic.loop();
    return;
  }

  if (forestGameOver) return;

  // 이미 클리어 상태면 다음 스토리(STORY_4)로 이동
  if (forestCleared) {
    gameState = "STORY_4";
    currentIdx = 0;
    charIdx = 0;
    isTyping = true;
    isWaitingForText = false;
    return;
  }

  let hitCorner = false;
  for (let c of forestCorners) {
    let d = dist(forestPlayer.x, forestPlayer.y, c.x, c.y);
    if (d < TURN_RADIUS && !c.used) {
      forestPlayer.dir = c.nextDir;
      c.used = true;
      forestClearCount++;

      if (forestClearCount === 11) {
        forestFairyMsg = "거의 다 왔다!";
        forestFairyTimer = 180; // 3초 정도
        forestTargetVolume = 0.15;
      }

      if (forestClearCount >= 13) {
        forestCleared = true;
        if (forestMusic && forestMusic.stop) forestMusic.stop();
      }

      hitCorner = true;
      break;
    }
  }

  // 코너 아닌 곳에서 클릭
  if (!hitCorner) {
    forestGameOver = true;
  }
}

function distToSegment(px, py, x1, y1, x2, y2) {
  let A = px - x1;
  let B = py - y1;
  let C = x2 - x1;
  let D = y2 - y1;
  let dot = A * C + B * D;
  let lenSq = C * C + D * D;
  let t = constrain(dot / lenSq, 0, 1);
  let xx = x1 + C * t;
  let yy = y1 + D * t;
  return dist(px, py, xx, yy);
}

function drawForestTrees() {
  noStroke();
  for (let t of forestTrees) {
    fill(110, 70, 30);
    rect(t.x - 4, t.y, 8, 20);
    fill(40, 130, 40);
    circle(t.x, t.y - 10, t.size);
    circle(t.x - 10, t.y, t.size * 0.8);
    circle(t.x + 10, t.y, t.size * 0.8);
  }
}

function drawForestFairyMessage() {
  if (forestFairyTimer <= 0) return;
  forestFairyTimer--;

  push();
  translate(forestPlayer.x, forestPlayer.y - 80);
  rectMode(CENTER);
  fill(255);
  stroke(0);
  strokeWeight(1);
  rect(0, 0, 160, 40, 10);
  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("" + forestFairyMsg, 0, 0);
  pop();
}

// =====================================
// 키보드 조작 이벤트 시스템
// =====================================
function keyPressed() {
  // --- 미니게임 1(미로) 조작 핸들러 ---
  if (gameState === "MINIGAME_MAZE") {
    if ((minigameState === "gameover" || minigameState === "clear") && (key === 'r' || key === 'R')) {
      initGame(); minigameState = "game"; return;
    }
    if ((minigameState === "game" || minigameState === "minigame" || minigameState === "gameover") && (key === 'n' || key === 'N')) {
      minigameState = "clear"; return;
    }
    if (minigameState === "minigame" && key.toLowerCase() === minigameData.keyToPress.toLowerCase()) {
      minigameData.count++;
      if (minigameData.count >= minigameData.target) {
        minigameState = "game";
        mazePlayer.x = floor(mazePlayer.x / tile) * tile + tile / 2;
        mazePlayer.y = floor(mazePlayer.y / tile) * tile + tile / 2;
        moveCooldown = millis() + 500;
      }
    }
  }

  // --- 미니게임 2(동굴 런) 조작 핸들러 ---
  if (gameState.startsWith("MINIGAME_CAVE") && gameState !== "MINIGAME_CAVE_START") {
    if (key === ' ' && !cavePlayer.isJumping && gameState !== "MINIGAME_CAVE_INTRO") cavePlayer.jump();
    if ((key === 's' || key === 'S') && gameState !== "MINIGAME_CAVE_INTRO") cavePlayer.duck();
    if ((key === 'w' || key === 'W') && gameState !== "MINIGAME_CAVE_INTRO") cavePlayer.stand();

    if ((caveGameOver || gameState === "MINIGAME_CAVE_DIALOGUE") && (key === 'r' || key === 'R')) {
      resetGame();
    }
  }

  // --- 미니게임 3(숲속 길) 조작 핸들러 ---
  if (gameState === "MINIGAME_FOREST") {
    if (key === 'r' || key === 'R') {
      resetForestGame();
    }
    if (key === 'n' || key === 'N') {
      forestCleared = true;
      forestGameOver = false;
      forestClearCount = 14; // 바로 클리어 상태
      if (forestMusic && forestMusic.stop) forestMusic.stop();
    }
  }

  // --- 전역 N 스킵 기능 (동굴 액션 구간 전체 스킵 지원) ---
  if ((key === 'n' || key === 'N')) {
    if (gameState.startsWith("MINIGAME_CAVE") && gameState !== "MINIGAME_CAVE_CLEAR") {
      gameState = "MINIGAME_CAVE_CLEAR";
      clearAlpha = 255;
    }
  }

  if (key === 'f' || key === 'F') fullscreen(!fullscreen());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = floor(width / tile);
  rows = floor(height / tile);
  if (cols % 2 === 0) cols--;
  if (rows % 2 === 0) rows--;
  groundY = height - 50;
}

// =====================================
// 동굴 게임 엔티티 클래스 정의
// =====================================
class Player {
  constructor() {
    this.w = 40; this.h = 95;
    this.x = 100; this.y = groundY - this.h;
    this.vy = 0; this.vx = 0;
    this.gravity = 0.7;
    this.isJumping = false;
    this.isDucking = false;
    this.speed = 8.5;
  }
  jump() { this.vy = -16; this.isJumping = true; this.stand(); }
  duck() { if (!this.isJumping) { this.h = 45; this.y = groundY - this.h; this.isDucking = true; } }
  stand() { this.h = 95; this.isDucking = false; }
  move(dir) { this.vx = dir * this.speed; }
  update() {
    this.vy += this.gravity;
    this.y += this.vy;
    this.x += this.vx;
    this.x = constrain(this.x, 0, width - this.w);
    if (this.y >= groundY - this.h) { this.y = groundY - this.h; this.vy = 0; this.isJumping = false; }
  }
  show() {
    push();
    noStroke();
    fill(255, 150, 180);
    rect(this.x, this.y + (this.isDucking ? 15 : 35), this.w, this.h - (this.isDucking ? 15 : 35), 8);
    fill(255, 220, 185);
    let headY = this.y + (this.isDucking ? 8 : 15);
    circle(this.x + this.w / 2, headY, 34);
    fill(101, 67, 33);
    arc(this.x + this.w / 2, headY - 6, 40, 34, PI, TWO_PI);
    rect(this.x + this.w / 2 - 20, headY - 6, 7, 34, 3);
    rect(this.x + this.w / 2 + 13, headY - 6, 7, 34, 3);
    pop();
  }
}

class Fairy {
  constructor(p) { this.player = p; this.x = p.x - 40; this.y = p.y; this.angle = 0; }
  update() {
    let targetX = this.player.x - 45;
    let targetY = this.player.y - 20 + sin(this.angle) * 15;
    this.x = lerp(this.x, targetX, 0.1);
    this.y = lerp(this.y, targetY, 0.1);
    this.angle += 0.1;
  }
  show() {
    push();
    noStroke();
    fill(200, 255, 255, 150);
    ellipse(this.x - 11, this.y, 20, 14);
    ellipse(this.x + 11, this.y, 20, 14);
    fill(255, 255, 150);
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = 'yellow';
    circle(this.x, this.y, 24);
    pop();
  }
}

class TreasureChest {
  constructor() {
    this.w = 70; this.h = 55;
    this.x = width + 70;
    this.y = groundY - this.h;
    this.targetX = width / 2;
    this.isOpen = false;
  }
  update() {
    if (this.x > this.targetX) this.x -= 3;
  }
  show() {
    push();
    stroke(50, 30, 0);
    strokeWeight(2);
    fill(100, 60, 20);
    rect(this.x - this.w/2, this.y, this.w, this.h, 6);
    if (this.isOpen) {
      fill(255, 200, 0);
      rect(this.x - this.w/2, this.y - 7, this.w, 14, 3);
    } else {
      fill(150, 100, 50);
      rect(this.x - this.w/2, this.y, this.w, 14, 6);
    }
    fill(255, 215, 0);
    rect(this.x - 7, this.y + 20, 14, 14, 3);
    pop();
  }
  open() { this.isOpen = true; }
  hits(p) { return dist(this.x, this.y + this.h/2, p.x + p.w/2, p.y + p.h/2) < 55; }
}

class MagicKey {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isRising = true;
    this.isCollected = false;
    this.startY = y;
  }
  update() {
    if (this.isRising && !this.isCollected) {
      this.y -= 3;
      if (this.y < this.startY - 140) {
        this.isRising = false;
      }
    } else if (!this.isCollected) {
      this.y = (this.startY - 140) + sin(frameCount * 0.08) * 10;
    }
  }
  show() {
    if (this.isCollected) return;
    push();
    translate(this.x, this.y);
    noStroke();
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'rgba(255, 215, 0, 1)';
    fill(255, 215, 0);
    circle(0, -20, 28);
    fill(25, 20, 30);
    circle(0, -20, 10);
    fill(255, 215, 0);
    rect(-4, -6, 8, 35);
    rect(4, 7, 10, 5);
    rect(4, 18, 10, 5);
    pop();
  }
  collect() { this.isCollected = true; }
  hits(p) { return !this.isCollected && !this.isRising && dist(this.x, this.y, p.x + p.w/2, p.y + p.h/2) < 50; }
}

class Stone {
  constructor() {
    this.r = random(45, 90);
    this.x = width;
    this.y = groundY - this.r/2;
    this.speed = random(4, 13);
  }
  update() { this.x -= this.speed; }
  show() { fill(120); noStroke(); circle(this.x, this.y, this.r); }
  hits(p) { return dist(this.x, this.y, p.x + p.w/2, p.y + p.h/2) < (this.r/2 + p.w/2); }
  offscreen() { return this.x < -this.r; }
}

class Stalactite {
  constructor() {
    this.w = 30;
    this.h = 70;
    this.x = random(width * 0.2, width);
    this.y = 40;
    this.speed = random(6, 10);
  }
  update() { this.y += this.speed; this.x -= 2; }
  show() { fill(180); noStroke(); triangle(this.x, this.y, this.x + this.w, this.y, this.x + this.w / 2, this.y + this.h); }
  hits(p) { return (p.x < this.x + this.w && p.x + p.w > this.x && p.y < this.y + this.h && p.y + p.h > this.y); }
  offscreen() { return this.y > height; }
}

class Bat {
  constructor() {
    this.w = 55;
    this.h = 35;
    this.x = width;
    this.y = groundY - 85 + random(-50, 40);
    this.speed = random(3.4, 6.8);
    this.a = 0;
  }
  update() {
    this.x -= this.speed;
    this.y += sin(this.a) * 3.5;
    this.a += 0.25;
  }
  show() {
    push();
    translate(this.x, this.y);
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(0, 255, 255, 0.8)';
    fill(30, 0, 50);
    noStroke();
    ellipse(0, 0, this.w * 0.4, this.h);
    fill(40, 10, 80);
    beginShape();
    vertex(-7, 0); vertex(-35, -20); vertex(-20, 7);
    endShape(CLOSE);
    beginShape();
    vertex(7, 0); vertex(35, -20); vertex(20, 7);
    endShape(CLOSE);
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = 'white';
    fill(255);
    circle(-6, -3, 5);
    circle(6, -3, 5);
    pop();
  }
  hits(p) {
    return (p.x < this.x + this.w/2 && p.x + p.w > this.x - this.w/2 &&
            p.y < this.y + this.h/2 && p.y + p.h > this.y - this.h/2);
  }
  offscreen() { return this.x < -100; }
}
