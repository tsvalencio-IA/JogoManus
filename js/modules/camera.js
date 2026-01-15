/**
 * Módulo de Câmera Reutilizável - thIAguinho Engine
 * Gerencia o fluxo de vídeo e permissões.
 */
export const Camera = {
    video: null,
    stream: null,
    active: false,

    async init(videoElementId) {
        if (this.active) return this.video;

        try {
            this.video = document.getElementById(videoElementId);
            if (!this.video) throw new Error("Elemento de vídeo não encontrado.");

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user"
                },
                audio: false
            });

            this.video.srcObject = this.stream;
            this.video.setAttribute('playsinline', ''); 
            await this.video.play();
            
            this.active = true;
            console.log("📷 Câmera inicializada.");
            return this.video;
        } catch (err) {
            console.error("❌ Erro de Câmera:", err);
            alert("Por favor, permita o acesso à câmera para jogar.");
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
