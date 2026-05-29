import { MathParser } from '../math/MathParser.js';
/**
 * Modelo de la aplicación (arquitectura MVC).
 * Mantiene el estado del plano de coordenadas cartesianas (límites de visualización)
 * y la lista de funciones matemáticas a graficar.
 */
export class PlotterModel {
    constructor() {
        // Límites del visor en coordenadas matemáticas cartesianas
        this.xMin = -10;
        this.xMax = 10;
        this.yMin = -7.5;
        this.yMax = 7.5;
        // Lista de funciones matemáticas añadidas para graficar
        this.functions = [];
        // Observadores registrados para cambios de estado
        this.observers = [];
    }
    /**
     * Registra un observador (usualmente una vista) para ser notificado de cambios.
     */
    registerObserver(observer) {
        this.observers.push(observer);
    }
    /**
     * Notifica a todos los observadores registrados que el estado ha cambiado.
     */
    notifyObservers() {
        for (const observer of this.observers) {
            observer();
        }
    }
    /**
     * Devuelve una copia de la lista de funciones.
     */
    getFunctions() {
        return [...this.functions];
    }
    /**
     * Restablece la vista a los límites predeterminados centrándose en el origen,
     * recalculando el eje Y según la relación de aspecto del canvas.
     */
    resetView(canvasWidth, canvasHeight) {
        this.xMin = -10;
        this.xMax = 10;
        const aspect = canvasWidth / canvasHeight;
        const rangeX = this.xMax - this.xMin;
        const rangeY = rangeX / aspect;
        this.yMin = -rangeY / 2;
        this.yMax = rangeY / 2;
        this.notifyObservers();
    }
    /**
     * Ajusta los límites del visor conservando el centro y adaptando la relación de aspecto.
     */
    adjustAspectRatio(canvasWidth, canvasHeight) {
        const centerOldX = (this.xMax + this.xMin) / 2;
        const centerOldY = (this.yMax + this.yMin) / 2;
        const rangeOldX = this.xMax - this.xMin;
        const aspect = canvasWidth / canvasHeight;
        const newRangeY = rangeOldX / aspect;
        this.yMin = centerOldY - newRangeY / 2;
        this.yMax = centerOldY + newRangeY / 2;
        this.notifyObservers();
    }
    /**
     * Realiza un zoom en base a un factor y a un centro en coordenadas de pantalla.
     */
    zoom(factor, centerSx, centerSy, canvasWidth, canvasHeight) {
        // Obtener las coordenadas matemáticas del centro del zoom antes de aplicarlo
        const cx = this.xMin + (centerSx / canvasWidth) * (this.xMax - this.xMin);
        const cy = this.yMin + ((canvasHeight - centerSy) / canvasHeight) * (this.yMax - this.yMin);
        const rangeX = this.xMax - this.xMin;
        const rangeY = this.yMax - this.yMin;
        const newRangeX = rangeX * factor;
        const newRangeY = rangeY * factor;
        // Porcentaje de la posición del cursor sobre el tamaño del lienzo
        const pctX = centerSx / canvasWidth;
        const pctY = (canvasHeight - centerSy) / canvasHeight;
        this.xMin = cx - pctX * newRangeX;
        this.xMax = cx + (1 - pctX) * newRangeX;
        this.yMin = cy - pctY * newRangeY;
        this.yMax = cy + (1 - pctY) * newRangeY;
        this.notifyObservers();
    }
    /**
     * Desplaza los límites del plano (paneo) basándose en una diferencia de píxeles de pantalla.
     */
    pan(dsx, dsy, canvasWidth, canvasHeight) {
        const rangeX = this.xMax - this.xMin;
        const rangeY = this.yMax - this.yMin;
        // Convertir delta de pantalla a delta matemático
        const dx = (dsx / canvasWidth) * rangeX;
        const dy = (dsy / canvasHeight) * rangeY;
        this.xMin -= dx;
        this.xMax -= dx;
        this.yMin -= dy;
        this.yMax -= dy;
        this.notifyObservers();
    }
    /**
     * Intenta agregar una nueva función matemática al listado.
     * Lanza un error si la expresión es inválida.
     */
    addFunction(expression, color) {
        const parser = new MathParser(expression);
        // Instanciar el objeto PlotFunction con ID aleatorio
        const newFunc = {
            id: Math.random().toString(36).substring(2, 9),
            expression: expression.trim(),
            color: color,
            visible: true,
            parser: parser
        };
        this.functions.push(newFunc);
        this.notifyObservers();
        return newFunc;
    }
    /**
     * Elimina una función de la lista a partir de su ID único.
     */
    removeFunction(id) {
        this.functions = this.functions.filter((f) => f.id !== id);
        this.notifyObservers();
    }
    /**
     * Alterna la visibilidad (dibujo en pantalla) de una función.
     */
    toggleFunctionVisibility(id, visible) {
        const func = this.functions.find((f) => f.id === id);
        if (func) {
            func.visible = visible;
            this.notifyObservers();
        }
    }
}
