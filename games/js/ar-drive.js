import { initCamera } from './camera.js';
import { PoseEstimator } from './pose-estimator.js';

let video, canvas, ctx;
let poseEstimator;
let roadOffset = 0;

function setupCanvas() {
  video = document.getElementById('video');
  canvas = document.getElementById('overlay');
  ctx = canvas.getContext('2d');

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();
}

function drawRoad() {
  const width = canvas.width;
  const height = canvas.height;
  const laneWidth = width / 3;
  const segments = 20;
  const segmentHeight = height / segments;

  ctx.clearRect(0, 0, width, height);

  // Pista
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, width, height);

  // Linhas da pista
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  for (let i = 0; i < segments; i++) {
    const y = (i * segmentHeight - roadOffset) % segmentHeight;
    ctx.beginPath();
    ctx.moveTo(laneWidth, y);
    ctx.lineTo(laneWidth, y + segmentHeight / 2);
    ctx.moveTo(2 * laneWidth, y);
    ctx.lineTo(2 * laneWidth, y + segmentHeight / 2);
    ctx.stroke();
  }

  // Carro
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(width / 2 - 20, height - 100, 40, 80);
}

function updateGame(pose) {
  if (!pose) return;

  const { leftShoulder, rightShoulder, leftElbow, rightElbow } = pose;
  if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow) return;

  // Simula volante: diferença horizontal entre cotovelos
  const steering = (rightElbow.x - leftElbow.x) * 2; // escala para sensibilidade
  const carX = canvas.width / 2 + steering * canvas.width / 4;

  // Atualiza estrada com leve movimento
  roadOffset = (roadOffset + 5) % 20;

  drawRoad();

  // Desenha direção do carro
  ctx.save();
  ctx.translate(carX, canvas.height - 60);
  ctx.rotate(steering * 0.2);
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(-15, -30, 30, 60);
  ctx.restore();
}

async function init() {
  setupCanvas();
  await initCamera(video);
  poseEstimator = new PoseEstimator(video, updateGame);
}

init();
