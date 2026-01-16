import * as mpPose from 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1642160291/index.js';

export class PoseEstimator {
  constructor(video, onPose) {
    this.onPose = onPose;
    this.pose = new mpPose.Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`;
      }
    });
    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    this.pose.onResults(this.handleResults.bind(this));
    this.video = video;
    this.processing = false;
    this.start();
  }

  start() {
    const tick = () => {
      if (!this.processing && this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.processing = true;
        this.pose.send({ image: this.video }).finally(() => {
          this.processing = false;
        });
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  handleResults(results) {
    if (!results.poseLandmarks) {
      this.onPose(null);
      return;
    }

    const pose = {};
    const landmarks = results.poseLandmarks;
    const names = [
      'nose', 'leftEyeInner', 'leftEye', 'leftEyeOuter',
      'rightEyeInner', 'rightEye', 'rightEyeOuter', 'leftEar',
      'rightEar', 'mouthLeft', 'mouthRight', 'leftShoulder',
      'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist',
      'rightWrist', 'leftPinky', 'rightPinky', 'leftIndex',
      'rightIndex', 'leftThumb', 'rightThumb', 'leftHip',
      'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle',
      'rightAnkle', 'leftHeel', 'rightHeel', 'leftFootIndex',
      'rightFootIndex'
    ];

    // Mapeia apenas partes relevantes
    const keyPoints = [
      'nose', 'leftShoulder', 'rightShoulder',
      'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist',
      'leftHip', 'rightHip', 'leftKnee', 'rightKnee',
      'leftAnkle', 'rightAnkle'
    ];

    for (let i = 0; i < landmarks.length; i++) {
      const name = names[i];
      if (keyPoints.includes(name)) {
        pose[name] = {
          x: landmarks[i].x,
          y: landmarks[i].y,
          z: landmarks[i].z,
          visibility: landmarks[i].visibility
        };
      }
    }

    this.onPose(pose);
  }
}
