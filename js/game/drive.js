/**
 * AR DRIVE - Lógica de Jogo Completa
 * Simulação de direção baseada em movimento de braços.
 */
import { Camera } from '../modules/camera.js';
import { IA } from '../modules/ia.js';

export const ARDrive = {
    scene: null, camera: null, renderer: null,
    car: null, road: null,
    speed: 0, steering: 0,
    lastFrameData: null,
    active: false,

    async init() {
        console.log("🚗 Inicializando AR DRIVE...");
        await Camera.init('video-feed');
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('game-canvas'), 
            alpha: true,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.setupLights();
        this.createObjects();
        
        this.camera.position.set(0, 3, 6);
        this.camera.lookAt(0, 0, 0);

        this.active = true;
        this.animate();
    },

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(5, 10, 7);
        this.scene.add(sun);
    },

    createObjects() {
        // Carro Detalhado
        const carGroup = new THREE.Group();
        
        // Corpo
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.5, 2.5),
            new THREE.MeshPhongMaterial({ color: 0x00f3ff, shininess: 100 })
        );
        body.position.y = 0.6;
        carGroup.add(body);

        // Cabine
        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 0.4, 1.2),
            new THREE.MeshPhongMaterial({ color: 0x333333, transparent: true, opacity: 0.7 })
        );
        cabin.position.set(0, 1.0, -0.2);
        carGroup.add(cabin);

        // Rodas
        const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const wheelMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
        const wheelPos = [
            [-0.7, 0.3, 0.8], [0.7, 0.3, 0.8],
            [-0.7, 0.3, -0.8], [0.7, 0.3, -0.8]
        ];
        wheelPos.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            carGroup.add(wheel);
        });

        this.car = carGroup;
        this.scene.add(this.car);

        // Estrada com textura procedural
        const roadGeo = new THREE.PlaneGeometry(12, 2000);
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([20, 20]);
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(64, 0); ctx.lineTo(64, 128); ctx.stroke();
        
        const roadTex = new THREE.CanvasTexture(canvas);
        roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
        roadTex.repeat.set(1, 100);
        
        this.road = new THREE.Mesh(roadGeo, new THREE.MeshPhongMaterial({ map: roadTex }));
        this.road.rotation.x = -Math.PI / 2;
        this.scene.add(this.road);
    },

    animate() {
        if (!this.active) return;
        requestAnimationFrame(() => this.animate());

        if (Camera.active) {
            const analysis = IA.analyzeMotion(Camera.video, this.lastFrameData);
            this.lastFrameData = analysis.frameData;

            // Lógica de Direção (Steering)
            // Sensibilidade ajustada para "volante"
            const targetSteering = -analysis.directionX * 0.15;
            this.steering += (targetSteering - this.steering) * 0.1;

            // Lógica de Velocidade
            const targetSpeed = Math.min(160, analysis.intensity * 1.5);
            this.speed += (targetSpeed - this.speed) * 0.05;
        }

        // Atualizar Carro
        this.car.position.x += this.steering;
        this.car.position.x = Math.max(-5, Math.min(5, this.car.position.x));
        this.car.rotation.y = -this.steering * 3;
        this.car.rotation.z = -this.steering * 1.5; // Inclinação lateral

        // Movimento da Estrada
        this.road.material.map.offset.y += this.speed * 0.0005;

        // UI
        const speedEl = document.getElementById('speed');
        if (speedEl) speedEl.innerText = Math.round(this.speed);

        this.renderer.render(this.scene, this.camera);
    }
};
