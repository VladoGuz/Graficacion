/**
 * Vista del lienzo (arquitectura MVC).
 * Encargada de renderizar los elementos gráficos sobre el elemento HTML Canvas:
 * cuadrícula, ejes cartesianos, marcas de números graduados y las gráficas de las funciones.
 */
export class CanvasView {
    constructor(canvas, model) {
        this.canvas = canvas;
        this.graphics = canvas.getContext('2d');
        this.model = model;
        // Registrar esta vista como observadora del modelo
        this.model.registerObserver(() => this.paint());
    }
    /**
     * Convierte coordenadas matemáticas (x, y) a coordenadas de píxeles en pantalla (sx, sy).
     */
    toScreen(x, y) {
        const sx = ((x - this.model.xMin) / (this.model.xMax - this.model.xMin)) * this.canvas.width;
        const sy = this.canvas.height - ((y - this.model.yMin) / (this.model.yMax - this.model.yMin)) * this.canvas.height;
        return { sx, sy };
    }
    /**
     * Convierte coordenadas de píxeles en pantalla (sx, sy) a coordenadas matemáticas (x, y).
     */
    toMap(sx, sy) {
        const x = this.model.xMin + (sx / this.canvas.width) * (this.model.xMax - this.model.xMin);
        const y = this.model.yMin + ((this.canvas.height - sy) / this.canvas.height) * (this.model.yMax - this.model.yMin);
        return { x, y };
    }
    /**
     * Devuelve un paso de cuadrícula limpio y redondeado basado en el rango actual.
     * Esto previene que se dibujen demasiadas líneas de cuadrícula juntas al hacer zoom.
     */
    getGridStep(range) {
        const targetStep = range / 10;
        const magnitude = Math.pow(10, Math.floor(Math.log10(targetStep)));
        const normalized = targetStep / magnitude;
        if (normalized < 1.5)
            return 1 * magnitude;
        if (normalized < 3.5)
            return 2 * magnitude;
        if (normalized < 7.5)
            return 5 * magnitude;
        return 10 * magnitude;
    }
    /**
     * Redibuja completamente el lienzo con la cuadrícula, los ejes, las marcas y las funciones.
     */
    paint() {
        const ctx = this.graphics;
        const width = this.canvas.width;
        const height = this.canvas.height;
        // 1. Limpiar fondo (Fondo cálido off-white)
        ctx.fillStyle = '#F6F4F1';
        ctx.fillRect(0, 0, width, height);
        // Calcular el espaciado óptimo para la cuadrícula
        const stepX = this.getGridStep(this.model.xMax - this.model.xMin);
        const stepY = this.getGridStep(this.model.yMax - this.model.yMin);
        // 2. Dibujar líneas secundarias de la cuadrícula (oscuras semitransparentes)
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        // Líneas verticales de la cuadrícula
        const startX = Math.ceil(this.model.xMin / stepX) * stepX;
        for (let x = startX; x <= this.model.xMax; x += stepX) {
            const { sx } = this.toScreen(x, 0);
            ctx.beginPath();
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx, height);
            ctx.stroke();
        }
        // Líneas horizontales de la cuadrícula
        const startY = Math.ceil(this.model.yMin / stepY) * stepY;
        for (let y = startY; y <= this.model.yMax; y += stepY) {
            const { sy } = this.toScreen(0, y);
            ctx.beginPath();
            ctx.moveTo(0, sy);
            ctx.lineTo(width, sy);
            ctx.stroke();
        }
        // 3. Dibujar ejes principales X e Y (oscuros semitransparentes)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.lineWidth = 1.5;
        // Eje X (donde y = 0)
        const { sy: originSy } = this.toScreen(0, 0);
        ctx.beginPath();
        ctx.moveTo(0, originSy);
        ctx.lineTo(width, originSy);
        ctx.stroke();
        // Eje Y (donde x = 0)
        const { sx: originSx } = this.toScreen(0, 0);
        ctx.beginPath();
        ctx.moveTo(originSx, 0);
        ctx.lineTo(originSx, height);
        ctx.stroke();
        // 4. Graduar ejes con marcas (ticks) y números
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.font = '11px "Outfit", "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        // Asegurarse de mantener las etiquetas legibles en pantalla si el eje correspondiente está fuera de los bordes
        const labelSy = Math.max(10, Math.min(height - 20, originSy + 5));
        const labelSx = Math.max(25, Math.min(width - 15, originSx - 8));
        // Marcas del Eje X
        for (let x = startX; x <= this.model.xMax; x += stepX) {
            if (Math.abs(x) < 1e-10)
                continue; // Saltar el origen (0)
            const { sx } = this.toScreen(x, 0);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.beginPath();
            ctx.moveTo(sx, labelSy - 5);
            ctx.lineTo(sx, labelSy + 2);
            ctx.stroke();
            const labelText = Number(x.toFixed(8)).toString();
            ctx.fillText(labelText, sx, labelSy + 5);
        }
        // Marcas del Eje Y
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let y = startY; y <= this.model.yMax; y += stepY) {
            if (Math.abs(y) < 1e-10)
                continue; // Saltar el origen (0)
            const { sy } = this.toScreen(0, y);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.beginPath();
            ctx.moveTo(labelSx - 2, sy);
            ctx.lineTo(labelSx + 5, sy);
            ctx.stroke();
            const labelText = Number(y.toFixed(8)).toString();
            ctx.fillText(labelText, labelSx - 5, sy);
        }
        // Dibujar el origen '0'
        const { sx: zeroSx, sy: zeroSy } = this.toScreen(0, 0);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('0', zeroSx - 5, zeroSy + 5);
        // 5. Graficar curvas de las funciones matemáticas
        for (const func of this.model.getFunctions()) {
            if (!func.visible || !func.parser)
                continue;
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = func.color;
            ctx.beginPath();
            let inPath = false;
            let prevSy = 0;
            // Escanear píxel a píxel a lo largo del ancho del canvas
            for (let sx = 0; sx <= width; sx++) {
                const { x } = this.toMap(sx, 0);
                let y = NaN;
                try {
                    y = func.parser.evaluate(x);
                }
                catch (e) {
                    // Ignorar errores locales de evaluación (ej. raíces de negativos, divisiones entre cero, etc.)
                    y = NaN;
                }
                if (isNaN(y) || !isFinite(y)) {
                    inPath = false;
                    continue;
                }
                const { sy } = this.toScreen(x, y);
                // Control de discontinuidades (ej. en tan(x) o 1/x)
                // Si hay saltos bruscos en pantalla cambiando de signo, se corta la línea
                // para evitar graficar las asíntotas verticales artificialmente conectadas
                if (inPath && Math.abs(sy - prevSy) > height * 1.5) {
                    inPath = false;
                }
                if (!inPath) {
                    ctx.moveTo(sx, sy);
                    inPath = true;
                }
                else {
                    ctx.lineTo(sx, sy);
                }
                prevSy = sy;
            }
            ctx.stroke();
        }
    }
}
