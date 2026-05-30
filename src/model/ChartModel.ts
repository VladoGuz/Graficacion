
export interface DataPoint {
  /** Identificador único alfanumérico autogenerado para rastrear la fila. */
  id: string;
  /** Nombre o etiqueta de la categoría (se muestra en el eje izquierdo). */
  label: string;
  /** Valor numérico (determina la longitud de la barra en el gráfico). */
  value: number;
  /** Indica si la barra debe resaltarse con el color de contraste/destaque. */
  highlight: boolean;
}

export class ChartModel {
  /** Título principal del gráfico que se mostrará en el lienzo. */
  private title: string = 'Rendimiento del Primer Trimestre';
  /** Subtítulo o unidad de medida que acompaña al gráfico. */
  private subtitle: string = 'En millones de USD';
  /** Nombre identificador de la paleta de colores seleccionada. */
  private paletteName: string = 'blue';
  /** Lista interna de datos que componen las barras del gráfico. */
  private dataPoints: DataPoint[] = [];
  /** Lista de callbacks de suscriptores para notificar actualizaciones. */
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadSampleData();
  }

  /**
   * Registra un callback suscriptor para escuchar cambios de estado en el modelo.
   * Usualmente implementado por el controlador para mandar a redibujar la vista.
   * 
   * @param listener Callback de tipo void.
   */
  public subscribe(listener: () => void): void {
    this.listeners.push(listener);
  }

  /**
   * Ejecuta todos los callbacks de los suscriptores registrados.
   * Se llama internamente cada vez que se modifica cualquier propiedad del modelo.
   */
  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /** Obtiene el título principal actual del gráfico. */
  public getTitle(): string {
    return this.title;
  }

  /**
   * Establece un nuevo título para el gráfico y dispara la notificación de cambio de estado.
   * 
   * @param title Nuevo texto para el título.
   */
  public setTitle(title: string): void {
    this.title = title;
    this.notify();
  }

  /** Obtiene el subtítulo (o unidad de medida) actual del gráfico. */
  public getSubtitle(): string {
    return this.subtitle;
  }

  /**
   * Establece un nuevo subtítulo para el gráfico y dispara la notificación de cambio de estado.
   * 
   * @param subtitle Nuevo texto para el subtítulo.
   */
  public setSubtitle(subtitle: string): void {
    this.subtitle = subtitle;
    this.notify();
  }

  /** Obtiene el nombre de la paleta de colores activa. */
  public getPaletteName(): string {
    return this.paletteName;
  }

  /**
   * Modifica la paleta activa y dispara la notificación de cambio de estado.
   * 
   * @param name Nombre de la paleta de colores.
   */
  public setPaletteName(name: string): void {
    this.paletteName = name;
    this.notify();
  }

  /**
   * Obtiene una copia superficial del arreglo de categorías y valores actuales.
   * 
   * @returns Copia del arreglo DataPoint[].
   */
  public getDataPoints(): DataPoint[] {
    return [...this.dataPoints];
  }

  /**
   * Añade una nueva categoría con su valor al modelo y genera su ID único aleatorio.
   * 
   * @param label Nombre de la categoría.
   * @param value Valor numérico de la barra.
   * @param highlight Si debe usar color de destaque (opcional, por defecto false).
   */
  public addDataPoint(label: string, value: number, highlight: boolean = false): void {
    const id = Math.random().toString(36).substring(2, 9);
    this.dataPoints.push({ id, label, value, highlight });
    this.notify();
  }

  /**
   * Actualiza los datos de una categoría existente mediante su identificador.
   * 
   * @param id ID único de la fila.
   * @param label Nuevo nombre de la categoría.
   * @param value Nuevo valor numérico de la barra.
   * @param highlight Si debe resaltarse.
   */
  public updateDataPoint(id: string, label: string, value: number, highlight: boolean): void {
    const item = this.dataPoints.find(dp => dp.id === id);
    if (item) {
      item.label = label;
      item.value = value;
      item.highlight = highlight;
      this.notify();
    }
  }

  /**
   * Elimina una categoría del modelo por su identificador.
   * 
   * @param id ID único de la fila a remover.
   */
  public removeDataPoint(id: string): void {
    this.dataPoints = this.dataPoints.filter(dp => dp.id !== id);
    this.notify();
  }

  /**
   * Elimina todas las categorías del gráfico para dejarlo en blanco.
   */
  public clearData(): void {
    this.dataPoints = [];
    this.notify();
  }

  /**
   * Carga un conjunto inicial de datos por defecto para demostrar visualmente el gráfico.
   */
  public loadSampleData(): void {
    this.dataPoints = [
      { id: '1', label: 'Enero', value: 45, highlight: false },
      { id: '2', label: 'Febrero', value: 68, highlight: false },
      { id: '3', label: 'Marzo', value: 85, highlight: true }, // Resaltado por defecto
      { id: '4', label: 'Abril', value: 50, highlight: false }
    ];
    this.notify();
  }
}
