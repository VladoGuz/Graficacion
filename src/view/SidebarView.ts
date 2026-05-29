import { PlotterModel } from '../model/PlotterModel.js';

/**
 * Vista de la barra lateral (arquitectura MVC).
 * Administra y actualiza todos los componentes de interfaz HTML del panel lateral:
 * la lista de funciones activas, límites de visor, mensajes de error y coordenadas del cursor.
 */
export class SidebarView {
  private model: PlotterModel;

  // Referencias a los elementos del DOM
  private listContainer: HTMLDivElement;
  private rangeXText: HTMLSpanElement;
  private rangeYText: HTMLSpanElement;
  private errorFeedback: HTMLDivElement;
  private errorMessage: HTMLSpanElement;
  private coordX: HTMLSpanElement;
  private coordY: HTMLSpanElement;

  constructor(
    model: PlotterModel,
    listContainer: HTMLDivElement,
    rangeXText: HTMLSpanElement,
    rangeYText: HTMLSpanElement,
    errorFeedback: HTMLDivElement,
    errorMessage: HTMLSpanElement,
    coordX: HTMLSpanElement,
    coordY: HTMLSpanElement
  ) {
    this.model = model;
    this.listContainer = listContainer;
    this.rangeXText = rangeXText;
    this.rangeYText = rangeYText;
    this.errorFeedback = errorFeedback;
    this.errorMessage = errorMessage;
    this.coordX = coordX;
    this.coordY = coordY;

    // Registrar observador para actualizar automáticamente la interfaz lateral
    this.model.registerObserver(() => {
      this.render();
      this.updateRanges();
    });
  }

  /**
   * Renderiza la lista de funciones matemáticas añadidas en el panel.
   */
  public render() {
    this.listContainer.innerHTML = '';
    const activeFunctions = this.model.getFunctions();

    if (activeFunctions.length === 0) {
      this.listContainer.innerHTML = `
        <div class="text-muted text-center py-3 fs-7">
          No hay funciones activas. Agrega una arriba.
        </div>`;
      return;
    }

    activeFunctions.forEach((func) => {
      const item = document.createElement('div');
      item.className = 'function-item';

      // Checkbox para alternar visibilidad
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'func-checkbox';
      checkbox.checked = func.visible;
      checkbox.addEventListener('change', () => {
        this.model.toggleFunctionVisibility(func.id, checkbox.checked);
      });

      // Indicador circular del color asignado
      const colorDot = document.createElement('span');
      colorDot.className = 'func-color-indicator';
      colorDot.style.backgroundColor = func.color;

      // Contenedor de la etiqueta matemática
      const labelContainer = document.createElement('div');
      labelContainer.className = 'func-expr-container';

      const textSpan = document.createElement('span');
      textSpan.className = 'func-math-expr';
      textSpan.textContent = `f(x) = ${func.expression}`;
      textSpan.style.color = '#000000ff';

      labelContainer.appendChild(textSpan);

      // Botón para eliminar la función de la lista
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'func-delete-btn';
      deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
      deleteBtn.title = 'Eliminar';
      deleteBtn.addEventListener('click', () => {
        this.model.removeFunction(func.id);
      });

      item.appendChild(checkbox);
      item.appendChild(colorDot);
      item.appendChild(labelContainer);
      item.appendChild(deleteBtn);

      this.listContainer.appendChild(item);
    });
  }

  /**
   * Actualiza los valores de texto de los rangos de coordenadas actuales (X y Y).
   */
  public updateRanges() {
    this.rangeXText.textContent = `${this.model.xMin.toFixed(2)} a ${this.model.xMax.toFixed(2)}`;
    this.rangeYText.textContent = `${this.model.yMin.toFixed(2)} a ${this.model.yMax.toFixed(2)}`;
  }

  /**
   * Actualiza el panel de visualización de coordenadas del cursor en tiempo real.
   */
  public updateCoordinates(x: number | null, y: number | null) {
    if (x === null || y === null) {
      this.coordX.textContent = '-';
      this.coordY.textContent = '-';
    } else {
      this.coordX.textContent = x.toFixed(4);
      this.coordY.textContent = y.toFixed(4);
    }
  }

  /**
   * Muestra el cuadro de retroalimentación de error con un mensaje específico de compilación.
   */
  public showError(message: string) {
    this.errorFeedback.classList.remove('d-none');
    this.errorMessage.textContent = message;
  }

  /**
   * Oculta el cuadro de retroalimentación de error.
   */
  public hideError() {
    this.errorFeedback.classList.add('d-none');
  }
}
