import { initCamera } from './camera.js';
import { PoseEstimator } from './pose-estimator.js';

let video, canvas, ctx, hud;
let poseEstimator;
let speed = 0;
let lastLeftKneeY = 0, lastRightKneeY = 0;
let frameCount = 0;

function setupCanvas() {
  video = document.getElementById('video');
  canvas = document.getElementById('overlay');
  hud = document.getElementById('hud');
  ctx = canvas.getContext('2d');

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();
}

function drawScenery() {
  const width = canvas.width;
  const height = canvas.height;
  const horizon = height * 0.4;

  ctx.clearRect(0, 0, width, height);

  // Céu
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, width, horizon);

  // Chão
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, horizon, width, height - horizon);

  // Linhas de velocidade
  const lines = Math.floor(speed * 2);
  ctx.strokeStyle = '#fff';
  for (let i = 0; i < lines; i++) {
    const x = (i * 50 - frameCount * speed * 2) % 50;
    ctx.beginPath();
    ctx.moveTo(x, horizon);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

function calculateSpeed(pose) {
  const { leftKnee, rightKnee } = pose;
  if (!leftKnee || !rightKnee) return 0;

  const leftDelta = Math.abs(leftKnee.y - lastLeftKneeY);
  const rightDelta = Math.abs(rightKnee.y - lastRightKneeY);
  lastLeftKneeY = leftKnee.y;
  lastRightKneeY = rightKnee.y;

  const legMovement = (leftDelta + rightDelta) * 100; // normaliza
  speed = Math.min(20, speed * 0.9 + legMovement * 0.1); // suavização
  frameCount++;

  return speed;
}

function updateGame(pose) {
  if (!pose) return;

  const currentSpeed = calculateSpeed(pose);
  hud.textContent = `Velocidade: ${currentSpeed.toFixed(1)} km/h`;

  drawScenery();
}

async function init() {
  setupCanvas();
  await initCamera(video);
  poseEstimator = new PoseEstimator(video, updateGame);
}

init();
