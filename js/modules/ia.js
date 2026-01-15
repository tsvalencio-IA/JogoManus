/**
 * Módulo de IA Reutilizável - thIAguinho Engine
 * Algoritmo de Fluxo Óptico Otimizado para Detecção de Movimento.
 */
export const IA = {
    analyzeMotion(video, lastFrameData) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = 160; 
        canvas.height = 120;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        let motionX = 0;
        let motionY = 0;
        let totalIntensity = 0;
        let pointsCount = 0;

        if (lastFrameData) {
            for (let i = 0; i < currentFrame.data.length; i += 32) { // Step de 32 para performance
                const rDiff = Math.abs(currentFrame.data[i] - lastFrameData[i]);
                const gDiff = Math.abs(currentFrame.data[i+1] - lastFrameData[i+1]);
                const bDiff = Math.abs(currentFrame.data[i+2] - lastFrameData[i+2]);
                
                const avgDiff = (rDiff + gDiff + bDiff) / 3;

                if (avgDiff > 35) { // Threshold de movimento
                    const x = (i / 4) % canvas.width;
                    const y = Math.floor((i / 4) / canvas.width);
                    
                    motionX += (x - canvas.width / 2);
                    motionY += (y - canvas.height / 2);
                    totalIntensity += avgDiff;
                    pointsCount++;
                }
            }
        }

        return {
            intensity: pointsCount > 0 ? totalIntensity / pointsCount : 0,
            directionX: pointsCount > 0 ? (motionX / pointsCount) / (canvas.width / 2) : 0,
            directionY: pointsCount > 0 ? (motionY / pointsCount) / (canvas.height / 2) : 0,
            frameData: currentFrame.data
        };
    }
};
