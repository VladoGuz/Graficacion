import { MathParser } from '../math/MathParser.js';

/**
 * Estructura de datos para representar una función en la lista de trazado.
 */
export interface PlotFunction {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  parser: MathParser;
}

/**
 * Tipo para los observadores (vistas) que escuchan cambios en el modelo.
 */
export type ModelObserver = () => void;

/**
 * Modelo de la aplicación (arquitectura MVC).
 * Mantiene el estado del plano de coordenadas cartesianas (límites de visualización)
 * y la lista de funciones matemáticas a graficar.
 */
export class PlotterModel {
  // Límites del visor en coordenadas matemáticas cartesianas
  public xMin: number = -10;
  public xMax: number = 10;
  public yMin: number = -7.5;
  public yMax: number = 7.5;

  // Lista de funciones matemáticas añadidas para graficar
  private functions: PlotFunction[] = [];

  // Observadores registrados para cambios de estado
  private observers: ModelObserver[] = [];

  constructor() {}

  /**
   * Registra un observador (usualmente una vista) para ser notificado de cambios.
   */
  public registerObserver(observer: ModelObserver) {
    this.observers.push(observer);
  }

  /**
   * Notifica a todos los observadores registrados que el estado ha cambiado.
   */
  public notifyObservers() {
    for (const observer of this.observers) {
      observer();
    }
  }

  /**
   * Devuelve una copia de la lista de funciones.
   */
  public getFunctions(): PlotFunction[] {
    return [...this.functions];
  }

  /**
   * Restablece la vista a los límites predeterminados centrándose en el origen,
   * recalculando el eje Y según la relación de aspecto del canvas.
   */
  public resetView(canvasWidth: number, canvasHeight: number) {
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
  public adjustAspectRatio(canvasWidth: number, canvasHeight: number) {
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
  public zoom(factor: number, centerSx: number, centerSy: number, canvasWidth: number, canvasHeight: number) {
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
  public pan(dsx: number, dsy: number, canvasWidth: number, canvasHeight: number) {
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
  public addFunction(expression: string, color: string): PlotFunction {
    const parser = new MathParser(expression);
    
    // Instanciar el objeto PlotFunction con ID aleatorio
    const newFunc: PlotFunction = {
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
  public removeFunction(id: string) {
    this.functions = this.functions.filter((f) => f.id !== id);
    this.notifyObservers();
  }

  /**
   * Alterna la visibilidad (dibujo en pantalla) de una función.
   */
  public toggleFunctionVisibility(id: string, visible: boolean) {
    const func = this.functions.find((f) => f.id === id);
    if (func) {
      func.visible = visible;
      this.notifyObservers();
    }
  }
}
