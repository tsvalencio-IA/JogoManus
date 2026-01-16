import { initCamera } from './camera.js';
import { PoseEstimator } from './pose-estimator.js';

let video, canvas, ctx, scoreEl;
let poseEstimator;
let score = 0;
let lastPose = null;
let frameCount = 0;

function setupCanvas() {
  video = document.getElementById('video');
  canvas = document.getElementById('overlay');
  scoreEl = document.getElementById('score');
  ctx = canvas.getContext('2d');

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();
}

function drawSkeleton(pose) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
  const offsetX = (canvas.width - video.videoWidth * scale) / 2;
  const offsetY = (canvas.height - video.videoHeight * scale) / 2;

  const drawPoint = (part) => {
    if (!part) return null;
    return {
      x: offsetX + part.x * video.videoWidth * scale,
      y: offsetY + part.y * video.videoHeight * scale
    };
  };

  const joints = [
    'nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar',
    'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow',
    'leftWrist', 'rightWrist', 'leftHip', 'rightHip',
    'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'
  ];

  const points = {};
  joints.forEach(joint => {
    points[joint] = drawPoint(pose[joint]);
  });

  // Conexões
  const connections = [
    ['leftShoulder', 'rightShoulder'],
    ['leftShoulder', 'leftElbow'],
    ['leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow'],
    ['rightElbow', 'rightWrist'],
    ['leftShoulder', 'leftHip'],
    ['rightShoulder', 'rightHip'],
    ['leftHip', 'rightHip'],
    ['leftHip', 'leftKnee'],
    ['leftKnee', 'leftAnkle'],
    ['rightHip', 'rightKnee'],
    ['rightKnee', 'rightAnkle']
  ];

  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 4;
  connections.forEach(([a, b]) => {
    if (points[a] && points[b]) {
      ctx.beginPath();
      ctx.moveTo(points[a].x, points[a].y);
      ctx.lineTo(points[b].x, points[b].y);
      ctx.stroke();
    }
  });

  // Pontos
  ctx.fillStyle = '#ff00ff';
  Object.values(points).forEach(p => {
    if (p) ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
  });
}

function calculateScore(currentPose) {
  if (!lastPose) {
    lastPose = JSON.parse(JSON.stringify(currentPose));
    return 0;
  }

  let totalDiff = 0;
  let count = 0;
  for (const key in currentPose) {
    if (currentPose[key] && lastPose[key]) {
      const dx = currentPose[key].x - lastPose[key].x;
      const dy = currentPose[key].y - lastPose[key].y;
      totalDiff += Math.sqrt(dx * dx + dy * dy);
      count++;
    }
  }

  const avgMovement = totalDiff / (count || 1);
  const intensity = avgMovement * 1000;
  const rhythm = Math.sin(frameCount * 0.1) > 0 ? 1 : 0.5; // simula ritmo básico
  const fluency = 1.0; // simplificado

  const frameScore = intensity * fluency * rhythm;
  score += frameScore * 0.1;

  // Atualiza lastPose com interpolação para suavidade
  for (const key in lastPose) {
    if (currentPose[key] && lastPose[key]) {
      lastPose[key].x = lastPose[key].x * 0.7 + currentPose[key].x * 0.3;
      lastPose[key].y = lastPose[key].y * 0.7 + currentPose[key].y * 0.3;
    }
  }

  frameCount++;
  return Math.floor(score);
}

function updateGame(pose) {
  if (!pose) return;

  drawSkeleton(pose);
  const currentScore = calculateScore(pose);
  scoreEl.textContent = `Score: ${currentScore}`;
}

async function init() {
  setupCanvas();
  await initCamera(video);
  poseEstimator = new PoseEstimator(video, updateGame);
}

init();
