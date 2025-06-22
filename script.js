const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const fieldBgImg = new Image();
fieldBgImg.src = "imagens/campo_cidade.jpeg";
const tractorImg = new Image();
tractorImg.src = "imagens/copiadetrator.webp";
const productImg = new Image();
productImg.src = "imagens/copia_de_milho.png";
const fuelImg = new Image();
fuelImg.src = "imagens/gasolina.png";
const marketImg = new Image();
marketImg.src = "imagens/mercado.webp";
const clockImg = new Image();
clockImg.src = "imagens/relogio.png";
const cityBgImg = new Image();
cityBgImg.src = "imagens/campo_e_cidade.jpeg";

let phase = 1;

const player = { x: 50, y: 400, width: 40, height: 40, speed: 2.2, carrying: false };
let product = { x: 100, y: 420, width: 30, height: 30, collected: false };
let market = { x: 700, y: 50, width: 50, height: 50 };
let fuelStation = { x: 600, y: 300, width: 40, height: 40 };
let clock = { x: 400, y: 300, width: 30, height: 30, visible: true, respawnTime: 5000 };
let obstacles = [
  { x: 300, y: 150, width: 100, height: 30 },
  { x: 500, y: 250, width: 30, height: 100 }
];

let keys = {}, score = 0, fuel = 100, timeLeft = 60;

document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function checkCollision(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

function movePlayer() {
  let nextX = player.x;
  let nextY = player.y;

  if (keys["arrowup"] || keys["w"]) nextY -= player.speed;
  if (keys["arrowdown"] || keys["s"]) nextY += player.speed;
  if (keys["arrowleft"] || keys["a"]) nextX -= player.speed;
  if (keys["arrowright"] || keys["d"]) nextX += player.speed;

  nextX = Math.max(0, Math.min(canvas.width - player.width, nextX));
  nextY = Math.max(0, Math.min(canvas.height - player.height, nextY));

  const future = { ...player, x: nextX, y: nextY };
  const blocked = obstacles.some(ob => checkCollision(future, ob));

  if (!blocked && fuel > 0) {
    player.x = nextX;
    player.y = nextY;
    fuel = Math.max(0, fuel - 0.015);
    document.getElementById("fuel").textContent = fuel.toFixed(0);
  }
}

function changePhase() {
  phase++;
  if (phase === 2) {
    obstacles = [
      { x: 200, y: 100, width: 50, height: 200 },
      { x: 500, y: 300, width: 200, height: 30 }
    ];
    market = { x: 700, y: 400, width: 50, height: 50 };
    fuelStation = { x: 100, y: 100, width: 40, height: 40 };
    product = { x: 50 + Math.random() * 300, y: 100 + Math.random() * 200, width: 30, height: 30, collected: false };
    player.x = 50;
    player.y = 400;
    clock = { x: 350, y: 200, width: 30, height: 30, visible: true, respawnTime: 5000 };
  }
}

function update() {
  movePlayer();

  if (!player.carrying && !product.collected && checkCollision(player, product)) {
    player.carrying = true;
    product.collected = true;
  }

  if (player.carrying && checkCollision(player, market)) {
    player.carrying = false;
    score++;
    document.getElementById("score").textContent = score;

    if (score === 3 && phase === 1) {
      changePhase();
    }

    product.x = 50 + Math.random() * 300;
    product.y = 400 + Math.random() * 60;
    product.collected = false;
  }

  if (checkCollision(player, fuelStation)) {
    fuel = 100;
    document.getElementById("fuel").textContent = fuel.toFixed(0);
  }

  if (clock.visible && checkCollision(player, clock)) {
    timeLeft += 2;
    document.getElementById("timer").textContent = timeLeft;
    clock.visible = false;

    setTimeout(() => {
      clock.x = Math.random() * (canvas.width - clock.width);
      clock.y = 250 + Math.random() * (canvas.height - 250 - clock.height);
      clock.visible = true;
    }, clock.respawnTime);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (phase === 1) {
    ctx.fillStyle = "#ffe0b2";
    ctx.fillRect(0, 0, canvas.width, 200);
    ctx.fillStyle = "#a5d6a7";
    ctx.fillRect(0, 200, canvas.width, 300);
  } else {
    if (cityBgImg.complete) {
      ctx.drawImage(cityBgImg, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#cfd8dc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  ctx.fillStyle = "#6d4c41";
  obstacles.forEach(ob => ctx.fillRect(ob.x, ob.y, ob.width, ob.height));

  ctx.drawImage(marketImg, market.x, market.y, market.width, market.height);
  ctx.drawImage(fuelImg, fuelStation.x, fuelStation.y, fuelStation.width, fuelStation.height);

  if (!product.collected) ctx.drawImage(productImg, product.x, product.y, product.width, product.height);
  if (clock.visible) ctx.drawImage(clockImg, clock.x, clock.y, clock.width, clock.height);

  ctx.save();
  ctx.translate(player.x + 20, player.y + 20);
  ctx.drawImage(tractorImg, -20, -20, 40, 40);
  ctx.restore();
}

function gameLoop() {
  if (timeLeft <= 0 || fuel <= 0) {
    alert("Fim de jogo! Pontuação final: " + score);
    document.location.reload();
    return;
  }
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

let musica = document.getElementById("musicaFundo");
let btnIniciar = document.getElementById("btnIniciar");
let telaInicial = document.getElementById("tela-inicial");
let divJogo = document.getElementById("jogo");
let btnVolume = document.getElementById("btnVolume");
let somAtivo = true;

btnIniciar.addEventListener("click", () => {
  telaInicial.style.display = "none";
  divJogo.style.display = "block";
  musica.volume = 0.3;
  musica.play();
  requestAnimationFrame(gameLoop);
});

btnVolume.addEventListener("click", () => {
  somAtivo = !somAtivo;
  musica.muted = !somAtivo;
  btnVolume.textContent = somAtivo ? "🔊" : "🔇";
});

setInterval(() => {
  if (timeLeft > 0) {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
  }
}, 1000);
