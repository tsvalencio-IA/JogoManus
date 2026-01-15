/**
 * Módulo de Câmera Reutilizável - thIAguinho Engine
 * Gerencia o fluxo de vídeo e permissões.
 */
export const Camera = {
    video: null,
    stream: null,
    active: false,

    async init(videoElementId = null) {
        if (this.active) return this.video;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user"
                },
                audio: false
            });

            if (videoElementId) {
                this.video = document.getElementById(videoElementId);
            } else {
                this.video = document.createElement('video');
            }

            this.video.srcObject = this.stream;
            this.video.setAttribute('playsinline', ''); // Necessário para iOS
            await this.video.play();
            
            this.active = true;
            console.log("📷 Câmera inicializada com sucesso.");
            return this.video;
        } catch (err) {
            console.error("❌ Erro ao acessar a câmera:", err);
            throw err;
        }
    },

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.active = false;
        }
    }
};
