/**
 * AR RUN - Lógica de Jogo Completa
 * Corrida infinita baseada em ritmo corporal.
 */
import { Camera } from '../modules/camera.js';
import { IA } from '../modules/ia.js';

export const ARRun = {
    scene: null, camera: null, renderer: null,
    runner: null, floor: null,
    distance: 0, velocity: 0,
    lastFrameData: null,
    active: false,

    async init() {
        console.log("🏃 Inicializando AR RUN...");
        await Camera.init('video-feed');
        
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 5, 20);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('game-canvas'), 
            alpha: true,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.createWorld();
        
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 1, 0);

        this.active = true;
        this.animate();
    },

    createWorld() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        
        // Runner Avatar
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.3, 1, 4, 8),
            new THREE.MeshPhongMaterial({ color: 0xff00ff })
        );
        body.position.y = 1;
        group.add(body);
        
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.25),
            new THREE.MeshPhongMaterial({ color: 0xffffff })
        );
        head.position.y = 1.8;
        group.add(head);

        this.runner = group;
        this.scene.add(this.runner);

        // Grid de Neon
        this.floor = new THREE.GridHelper(200, 100, 0x00f3ff, 0x111111);
        this.scene.add(this.floor);
    },

    animate() {
        if (!this.active) return;
        requestAnimationFrame(() => this.animate());

        if (Camera.active) {
            const analysis = IA.analyzeMotion(Camera.video, this.lastFrameData);
            this.lastFrameData = analysis.frameData;

            // Ritmo vira velocidade
            let targetVelocity = analysis.intensity * 0.4;
            this.velocity += (targetVelocity - this.velocity) * 0.1;
        }

        // Progresso
        this.distance += this.velocity * 0.1;
        this.floor.position.z = (this.distance % 2);
        
        // Animação de corrida
        const runCycle = Date.now() * 0.01 * this.velocity;
        this.runner.position.y = Math.abs(Math.sin(runCycle)) * 0.3;
        this.runner.rotation.x = Math.sin(runCycle) * 0.1;

        const distEl = document.getElementById('dist');
        if (distEl) distEl.innerText = Math.floor(this.distance);

        this.renderer.render(this.scene, this.camera);
    }
};
