export class ChartModel {
    /** Título principal del gráfico que se mostrará en el lienzo. */
    title = 'Rendimiento del Primer Trimestre';
    /** Subtítulo o unidad de medida que acompaña al gráfico. */
    subtitle = 'En millones de USD';
    /** Nombre identificador de la paleta de colores seleccionada. */
    paletteName = 'blue';
    /** Lista interna de datos que componen las barras del gráfico. */
    dataPoints = [];
    /** Lista de callbacks de suscriptores para notificar actualizaciones. */
    listeners = [];
    constructor() {
        this.loadSampleData();
    }
    /**
     * Registra un callback suscriptor para escuchar cambios de estado en el modelo.
     * Usualmente implementado por el controlador para mandar a redibujar la vista.
     *
     * @param listener Callback de tipo void.
     */
    subscribe(listener) {
        this.listeners.push(listener);
    }
    /**
     * Ejecuta todos los callbacks de los suscriptores registrados.
     * Se llama internamente cada vez que se modifica cualquier propiedad del modelo.
     */
    notify() {
        for (const listener of this.listeners) {
            listener();
        }
    }
    /** Obtiene el título principal actual del gráfico. */
    getTitle() {
        return this.title;
    }
    /**
     * Establece un nuevo título para el gráfico y dispara la notificación de cambio de estado.
     *
     * @param title Nuevo texto para el título.
     */
    setTitle(title) {
        this.title = title;
        this.notify();
    }
    /** Obtiene el subtítulo (o unidad de medida) actual del gráfico. */
    getSubtitle() {
        return this.subtitle;
    }
    /**
     * Establece un nuevo subtítulo para el gráfico y dispara la notificación de cambio de estado.
     *
     * @param subtitle Nuevo texto para el subtítulo.
     */
    setSubtitle(subtitle) {
        this.subtitle = subtitle;
        this.notify();
    }
    /** Obtiene el nombre de la paleta de colores activa. */
    getPaletteName() {
        return this.paletteName;
    }
    /**
     * Modifica la paleta activa y dispara la notificación de cambio de estado.
     *
     * @param name Nombre de la paleta de colores.
     */
    setPaletteName(name) {
        this.paletteName = name;
        this.notify();
    }
    /**
     * Obtiene una copia superficial del arreglo de categorías y valores actuales.
     *
     * @returns Copia del arreglo DataPoint[].
     */
    getDataPoints() {
        return [...this.dataPoints];
    }
    /**
     * Añade una nueva categoría con su valor al modelo y genera su ID único aleatorio.
     *
     * @param label Nombre de la categoría.
     * @param value Valor numérico de la barra.
     * @param highlight Si debe usar color de destaque (opcional, por defecto false).
     */
    addDataPoint(label, value, highlight = false) {
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
    updateDataPoint(id, label, value, highlight) {
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
    removeDataPoint(id) {
        this.dataPoints = this.dataPoints.filter(dp => dp.id !== id);
        this.notify();
    }
    /**
     * Elimina todas las categorías del gráfico para dejarlo en blanco.
     */
    clearData() {
        this.dataPoints = [];
        this.notify();
    }
    /**
     * Carga un conjunto inicial de datos por defecto para demostrar visualmente el gráfico.
     */
    loadSampleData() {
        this.dataPoints = [
            { id: '1', label: 'Enero', value: 45, highlight: false },
            { id: '2', label: 'Febrero', value: 68, highlight: false },
            { id: '3', label: 'Marzo', value: 85, highlight: true }, // Resaltado por defecto
            { id: '4', label: 'Abril', value: 50, highlight: false }
        ];
        this.notify();
    }
}
