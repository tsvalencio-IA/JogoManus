/**
 * Módulo de IA Reutilizável - thIAguinho Engine
 * Abstração para detecção de movimento e pose.
 */
export const IA = {
    model: null,
    lastResults: null,

    async init() {
        console.log("🧠 Inicializando IA de Visão...");
        // Aqui poderíamos carregar o MediaPipe ou TensorFlow.js
        // Para manter leve e funcional no GitHub Pages, usaremos detecção de movimento otimizada
        // com ganchos para expansão futura para PoseNet.
        return true;
    },

    /**
     * Analisa o movimento entre frames para detectar intensidade e direção.
     */
    analyzeMotion(video, lastFrameData) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = 160; // Baixa resolução para performance
        canvas.height = 120;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        let motionX = 0;
        let motionY = 0;
        let totalIntensity = 0;

        if (lastFrameData) {
            for (let i = 0; i < currentFrame.data.length; i += 16) {
                const diff = Math.abs(currentFrame.data[i] - lastFrameData[i]);
                if (diff > 30) {
                    const x = (i / 4) % canvas.width;
                    const y = Math.floor((i / 4) / canvas.width);
                    
                    motionX += (x - canvas.width / 2) * diff;
                    motionY += (y - canvas.height / 2) * diff;
                    totalIntensity += diff;
                }
            }
        }

        return {
            intensity: totalIntensity / 1000,
            directionX: totalIntensity > 0 ? motionX / totalIntensity : 0,
            directionY: totalIntensity > 0 ? motionY / totalIntensity : 0,
            frameData: currentFrame.data
        };
    }
};
