/**
 * AR DANCE - Lógica de Jogo Completa
 * Sistema de espelhamento e pontuação por fluidez.
 */
import { Camera } from '../modules/camera.js';
import { IA } from '../modules/ia.js';

export const ARDance = {
    scene: null, camera: null, renderer: null,
    avatar: null, particles: [],
    score: 0,
    lastFrameData: null,
    active: false,

    async init() {
        console.log("💃 Inicializando AR DANCE...");
        await Camera.init('video-feed');
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('game-canvas'), 
            alpha: true,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.createAvatar();
        this.camera.position.z = 5;

        this.active = true;
        this.animate();
    },

    createAvatar() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 1));
        
        this.avatar = new THREE.Group();
        
        // Núcleo de energia
        const core = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1, 1),
            new THREE.MeshPhongMaterial({ color: 0x00ff00, wireframe: true })
        );
        this.avatar.add(core);
        
        this.scene.add(this.avatar);
    },

    animate() {
        if (!this.active) return;
        requestAnimationFrame(() => this.animate());

        if (Camera.active) {
            const analysis = IA.analyzeMotion(Camera.video, this.lastFrameData);
            this.lastFrameData = analysis.frameData;

            // Avatar segue o centro do movimento
            const targetX = analysis.directionX * 3;
            const targetY = -analysis.directionY * 3;
            
            this.avatar.position.x += (targetX - this.avatar.position.x) * 0.1;
            this.avatar.position.y += (targetY - this.avatar.position.y) * 0.1;
            
            // Rotação baseada na intensidade
            this.avatar.rotation.y += analysis.intensity * 0.01;
            this.avatar.rotation.z += analysis.intensity * 0.005;

            // Pontuação
            if (analysis.intensity > 10) {
                this.score += Math.floor(analysis.intensity / 5);
            }
        }

        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.innerText = this.score;

        this.renderer.render(this.scene, this.camera);
    }
};
