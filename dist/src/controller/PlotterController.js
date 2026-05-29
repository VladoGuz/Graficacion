/**
 * Controlador de la aplicación (arquitectura MVC).
 * Captura todos los eventos del usuario en el DOM y coordina las actualizaciones
 * en el modelo y llamadas adicionales en las vistas.
 */
export class PlotterController {
    constructor(model, canvasView, sidebarView, form, funcInput, funcColor, btnZoomIn, btnZoomOut, btnReset, canvas, getNextColorCallback) {
        // Variables de control para el paneo por arrastre del mouse
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.model = model;
        this.canvasView = canvasView;
        this.sidebarView = sidebarView;
        this.form = form;
        this.funcInput = funcInput;
        this.funcColor = funcColor;
        this.btnZoomIn = btnZoomIn;
        this.btnZoomOut = btnZoomOut;
        this.btnReset = btnReset;
        this.canvas = canvas;
        this.getNextColorCallback = getNextColorCallback;
        this.bindEvents();
    }
    /**
     * Enlaza todos los event listeners de los botones, formularios y canvas.
     */
    bindEvents() {
        // Formulario de ingreso de función
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        // Movimiento del mouse sobre el canvas (coordenadas cursor)
        this.canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMoveCoords(e);
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.sidebarView.updateCoordinates(null, null);
        });
        // Zoom mediante la rueda del ratón
        this.canvas.addEventListener('wheel', (e) => {
            this.handleCanvasWheel(e);
        }, { passive: false });
        // Paneo por arrastre: Mousedown en el canvas
        this.canvas.addEventListener('mousedown', (e) => {
            this.handleCanvasMouseDown(e);
        });
        // Paneo por arrastre: Mousemove y Mouseup globales
        window.addEventListener('mousemove', (e) => {
            this.handleWindowMouseMoveDrag(e);
        });
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        // Controles de Vista: Botones
        this.btnZoomIn.addEventListener('click', () => {
            this.model.zoom(0.8, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width, this.canvas.height);
        });
        this.btnZoomOut.addEventListener('click', () => {
            this.model.zoom(1.2, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width, this.canvas.height);
        });
        this.btnReset.addEventListener('click', () => {
            this.model.resetView(this.canvas.width, this.canvas.height);
        });
        // Botones de presets rápidos
        document.querySelectorAll('.preset-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const expr = btn.getAttribute('data-expr');
                if (expr) {
                    this.tryAddFunction(expr, this.getNextColorCallback());
                }
            });
        });
    }
    /**
     * Procesa el envío del formulario al intentar agregar una nueva función.
     */
    handleFormSubmit() {
        const expression = this.funcInput.value;
        const color = this.funcColor.value;
        const success = this.tryAddFunction(expression, color);
        if (success) {
            this.funcInput.value = '';
            this.funcColor.value = this.getNextColorCallback();
        }
    }
    /**
     * Intenta compilar y graficar la función a través del modelo.
     * Si falla, muestra el banner de error.
     */
    tryAddFunction(expression, color) {
        try {
            this.model.addFunction(expression, color);
            this.sidebarView.hideError();
            return true;
        }
        catch (error) {
            this.sidebarView.showError(error.message || 'Error al compilar la función.');
            return false;
        }
    }
    /**
     * Muestra las coordenadas de la rejilla matemática bajo el puntero del mouse.
     */
    handleMouseMoveCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const { x, y } = this.canvasView.toMap(sx, sy);
        this.sidebarView.updateCoordinates(x, y);
    }
    /**
     * Maneja el evento de la rueda para aplicar zoom adaptado a la posición del puntero.
     */
    handleCanvasWheel(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const factor = e.deltaY < 0 ? 0.9 : 1.1;
        this.model.zoom(factor, sx, sy, this.canvas.width, this.canvas.height);
    }
    /**
     * Inicia el estado de arrastre para el paneo de la gráfica.
     */
    handleCanvasMouseDown(e) {
        if (e.button !== 0)
            return; // Solo click izquierdo
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastMouseX = e.clientX - rect.left;
        this.lastMouseY = e.clientY - rect.top;
    }
    /**
     * Arrastra el visor del plano conforme el mouse se desplaza con el botón apretado.
     */
    handleWindowMouseMoveDrag(e) {
        if (!this.isDragging)
            return;
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const dsx = sx - this.lastMouseX;
        const dsy = this.lastMouseY - sy;
        this.model.pan(dsx, dsy, this.canvas.width, this.canvas.height);
        this.lastMouseX = sx;
        this.lastMouseY = sy;
    }
}
