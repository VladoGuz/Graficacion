import { ChartModel, DataPoint } from '../model/ChartModel.js';
import { getPalette, adjustColorBrightness } from '../utils/colors.js';

export class ChartView {
  // Elementos del DOM
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private titleInput: HTMLInputElement;
  private subtitleInput: HTMLInputElement;
  private paletteSelect: HTMLSelectElement;
  private tableBody: HTMLTableSectionElement;

  private btnAddRow: HTMLButtonElement;
  private btnLoadSample: HTMLButtonElement;
  private btnClear: HTMLButtonElement;
  private btnExport: HTMLButtonElement;

  private paletteBasePreview: HTMLDivElement;
  private paletteAccentPreview: HTMLDivElement;
  private paletteBaseHex: HTMLSpanElement;
  private paletteAccentHex: HTMLSpanElement;
  private renderedInfo: HTMLSpanElement;

  // Parámetros de dimensionamiento del Canvas (unidades CSS lógicas)
  private readonly defaultWidth = 700;
  private readonly defaultHeight = 500;

  // Márgenes del gráfico para dejar espacio a los textos y ejes
  private readonly paddingTop = 100;
  private readonly paddingBottom = 60;
  private readonly paddingLeft = 150;
  private readonly paddingRight = 80;

  constructor() {
    this.initDOMElements();
  }

  /**
   * Obtiene las referencias de todos los elementos interactivos del HTML.
   */
  private initDOMElements(): void {
    this.canvas = document.getElementById('chartCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.titleInput = document.getElementById('chart-title-input') as HTMLInputElement;
    this.subtitleInput = document.getElementById('chart-subtitle-input') as HTMLInputElement;
    this.paletteSelect = document.getElementById('palette-select') as HTMLSelectElement;
    this.tableBody = document.getElementById('data-table-body') as HTMLTableSectionElement;

    this.btnAddRow = document.getElementById('btn-add-row') as HTMLButtonElement;
    this.btnLoadSample = document.getElementById('btn-load-sample') as HTMLButtonElement;
    this.btnClear = document.getElementById('btn-clear') as HTMLButtonElement;
    this.btnExport = document.getElementById('btn-export') as HTMLButtonElement;

    this.paletteBasePreview = document.getElementById('palette-preview-base') as HTMLDivElement;
    this.paletteAccentPreview = document.getElementById('palette-preview-accent') as HTMLDivElement;
    this.paletteBaseHex = document.getElementById('palette-hex-base') as HTMLSpanElement;
    this.paletteAccentHex = document.getElementById('palette-hex-accent') as HTMLSpanElement;
    this.renderedInfo = document.getElementById('rendered-info') as HTMLSpanElement;

    // Adapta el lienzo a la densidad de píxeles física de la pantalla (DPI)
    this.resizeCanvas();
  }

  /**
   * Corrige la resolución del lienzo en pantallas con alto DPI (como pantallas Retina o 4K).
   * Evita que el dibujo y las fuentes se vean borrosos o pixelados.
   */
  private resizeCanvas(): void {
    const ratio = window.devicePixelRatio || 1;
    // La resolución interna del canvas se escala con el ratio
    this.canvas.width = this.defaultWidth * ratio;
    this.canvas.height = this.defaultHeight * ratio;
    // Las dimensiones en la página (CSS) se mantienen constantes
    this.canvas.style.width = `${this.defaultWidth}px`;
    this.canvas.style.height = `${this.defaultHeight}px`;
    // Resetea cualquier escala previa y aplica la escala física
    this.ctx.resetTransform();
    this.ctx.scale(ratio, ratio);
  }

  /**
   * Enlaza el evento click de "Añadir fila" al controlador.
   */
  public bindAddRow(handler: () => void): void {
    this.btnAddRow.addEventListener('click', handler);
  }

  /**
   * Enlaza el evento click de "Cargar ejemplo" al controlador.
   */
  public bindLoadSample(handler: () => void): void {
    this.btnLoadSample.addEventListener('click', handler);
  }

  /**
   * Enlaza el evento click de "Limpiar todo" al controlador.
   */
  public bindClear(handler: () => void): void {
    this.btnClear.addEventListener('click', handler);
  }

  public bindExport(handler?: () => void): void {
    if (this.btnExport) {
      this.btnExport.addEventListener('click', () => {
        this.triggerPNGDownload();
        if (handler) handler();
      });
    }
  }

  /**
   * Enlaza el evento de entrada sobre el título al controlador.
   */
  public bindTitleChange(handler: (value: string) => void): void {
    this.titleInput.addEventListener('input', () => handler(this.titleInput.value));
  }

  /**
   * Enlaza el evento de entrada sobre el subtítulo al controlador.
   */
  public bindSubtitleChange(handler: (value: string) => void): void {
    this.subtitleInput.addEventListener('input', () => handler(this.subtitleInput.value));
  }

  /**
   * Enlaza el cambio de selección de paleta de colores al controlador.
   */
  public bindPaletteChange(handler: (value: string) => void): void {
    this.paletteSelect.addEventListener('change', () => handler(this.paletteSelect.value));
  }

  /**
   * Configura la escucha delegada de eventos dentro de la tabla de datos.
   * Captura adiciones, escrituras y eliminaciones en tiempo real para sincronizarlos con el modelo.
   */
  public bindTableEvents(
    onRowUpdate: (id: string, label: string, value: number, highlight: boolean) => void,
    onRowDelete: (id: string) => void
  ): void {
    // Escucha la escritura en los campos de Categoría y Valor
    this.tableBody.addEventListener('input', (e) => {
      const target = e.target as HTMLElement;
      const row = target.closest('tr') as HTMLTableRowElement;
      if (!row) return;
      const id = row.dataset.id!;

      const labelInput = row.querySelector('.row-label') as HTMLInputElement;
      const valueInput = row.querySelector('.row-value') as HTMLInputElement;
      const highlightCheckbox = row.querySelector('.row-highlight') as HTMLInputElement;

      const label = labelInput.value;
      const value = parseFloat(valueInput.value) || 0;
      const highlight = highlightCheckbox.checked;

      onRowUpdate(id, label, value, highlight);
    });

    // Escucha el cambio de estado del checkbox "Destacar"
    this.tableBody.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('row-highlight')) {
        const row = target.closest('tr') as HTMLTableRowElement;
        if (!row) return;
        const id = row.dataset.id!;

        const labelInput = row.querySelector('.row-label') as HTMLInputElement;
        const valueInput = row.querySelector('.row-value') as HTMLInputElement;
        const highlightCheckbox = target as HTMLInputElement;

        onRowUpdate(id, labelInput.value, parseFloat(valueInput.value) || 0, highlightCheckbox.checked);
      }
    });

    // Escucha el click sobre el botón eliminar fila
    this.tableBody.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const deleteBtn = target.closest('.btn-delete');
      if (deleteBtn) {
        const row = deleteBtn.closest('tr') as HTMLTableRowElement;
        if (row) {
          const id = row.dataset.id!;
          onRowDelete(id);
        }
      }
    });
  }

  /**
   * Método principal de renderizado que sincroniza la vista del DOM y del Canvas con los datos actuales del modelo.
   */
  public render(model: ChartModel): void {
    const dataPoints = model.getDataPoints();
    const paletteName = model.getPaletteName();
    const palette = getPalette(paletteName);

    // Sincroniza los controles de texto principales solo si el usuario no los está editando activamente
    if (document.activeElement !== this.titleInput) {
      this.titleInput.value = model.getTitle();
    }
    if (document.activeElement !== this.subtitleInput) {
      this.subtitleInput.value = model.getSubtitle();
    }
    if (this.paletteSelect.value !== paletteName) {
      this.paletteSelect.value = paletteName;
    }

    // Actualiza la previsualización del esquema de colores en el DOM
    this.paletteBasePreview.style.backgroundColor = palette.base;
    this.paletteAccentPreview.style.backgroundColor = palette.accent;
    this.paletteBaseHex.textContent = palette.base;
    this.paletteAccentHex.textContent = palette.accent;

    // Sincroniza las filas de datos en el panel lateral
    this.renderTable(dataPoints);

    // Dibuja el gráfico de barras 3D en el Canvas
    this.drawChart(model);

    // Actualiza la marca de tiempo de renderizado
    const now = new Date();
    this.renderedInfo.textContent = `Actualizado: ${now.toLocaleTimeString()}`;
  }

  /**
   * Sincroniza las filas de la tabla DOM de manera inteligente para evitar perder el foco e indicador de teclado (focus).
   */
  private renderTable(dataPoints: DataPoint[]): void {
    const existingRows = this.tableBody.children;

    // Si la cantidad de filas difiere, reconstruye la tabla completamente
    if (existingRows.length !== dataPoints.length) {
      this.tableBody.innerHTML = '';
      dataPoints.forEach(dp => {
        const tr = this.createTableRow(dp);
        this.tableBody.appendChild(tr);
      });
    } else {
      // Si la cantidad es igual, actualiza los valores inline sin recrear los nodos del DOM
      for (let i = 0; i < dataPoints.length; i++) {
        const dp = dataPoints[i];
        const tr = existingRows[i] as HTMLTableRowElement;
        tr.dataset.id = dp.id;

        const labelInput = tr.querySelector('.row-label') as HTMLInputElement;
        if (labelInput && document.activeElement !== labelInput && labelInput.value !== dp.label) {
          labelInput.value = dp.label;
        }

        const valueInput = tr.querySelector('.row-value') as HTMLInputElement;
        if (valueInput && document.activeElement !== valueInput) {
          const parsed = parseFloat(valueInput.value) || 0;
          if (parsed !== dp.value) {
            valueInput.value = dp.value.toString();
          }
        }

        const highlightCheck = tr.querySelector('.row-highlight') as HTMLInputElement;
        if (highlightCheck && highlightCheck.checked !== dp.highlight) {
          highlightCheck.checked = dp.highlight;
        }
      }
    }
  }

  /**
   * Crea y retorna una fila HTML estructurada (`<tr>`) para la tabla de edición de categorías.
   */
  private createTableRow(dp: DataPoint): HTMLTableRowElement {
    const tr = document.createElement('tr');
    tr.dataset.id = dp.id;
    tr.innerHTML = `
      <td>
        <input type="text" class="table-input row-label" value="${dp.label}" placeholder="Ej. Enero">
      </td>
      <td>
        <input type="number" class="table-input row-value" value="${dp.value}" placeholder="Ej. 100" step="any">
      </td>
      <td class="text-center">
        <div class="form-check form-switch d-inline-block">
          <input class="form-check-input row-highlight" type="checkbox" ${dp.highlight ? 'checked' : ''}>
        </div>
      </td>
      <td class="text-center">
        <button class="btn btn-link text-danger p-0 btn-delete" title="Eliminar fila">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
          </svg>
        </button>
      </td>
    `;
    return tr;
  }

  /**
   * Motor de dibujo principal. Renderiza el gráfico de barras 3D y los ejes sobre el Canvas 2D.
   */
  private drawChart(model: ChartModel): void {
    const ctx = this.ctx;
    const dataPoints = model.getDataPoints();
    const palette = getPalette(model.getPaletteName());

    // 1. Limpieza y fondo del Canvas
    ctx.fillStyle = '#F4EFE6'; // Fondo beige claro de la paleta
    ctx.fillRect(0, 0, this.defaultWidth, this.defaultHeight);

    // 2. Títulos y Subtítulos alineados a la izquierda en la parte superior
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#1e293b'; // Texto principal oscuro
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText(model.getTitle(), 24, 24);

    ctx.fillStyle = '#64748b'; // Subtítulo o unidades
    ctx.font = '500 13px Inter, sans-serif';
    ctx.fillText(model.getSubtitle(), 24, 54);

    // Renderiza mensaje por defecto si la lista de datos está vacía
    if (dataPoints.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Sin datos disponibles. Añada filas para graficar.', this.defaultWidth / 2, this.defaultHeight / 2);
      return;
    }

    // 3. Cálculo de límites y proporciones (Ejes y línea base en 0)
    const maxVal = Math.max(...dataPoints.map(d => d.value), 0);

    // Función auxiliar para obtener marcas del eje limpias y redondeadas
    const niceRoundNumber = (val: number): number => {
      if (val <= 0) return 10;
      const exponent = Math.floor(Math.log10(val));
      const fraction = val / Math.pow(10, exponent);
      let niceFraction;
      if (fraction <= 1.0) niceFraction = 1.0;
      else if (fraction <= 2.0) niceFraction = 2.0;
      else if (fraction <= 5.0) niceFraction = 5.0;
      else niceFraction = 10.0;
      return niceFraction * Math.pow(10, exponent);
    };

    let rawStep = maxVal / 4;
    if (rawStep === 0) rawStep = 25;
    const gridStep = niceRoundNumber(rawStep);
    const numSteps = Math.ceil((maxVal || 1) / gridStep) + 1;
    const rangeMax = gridStep * (numSteps - 1);

    const chartWidth = this.defaultWidth - this.paddingLeft - this.paddingRight;
    const chartHeight = this.defaultHeight - this.paddingTop - this.paddingBottom;

    // 4. Dibujo de líneas de referencia verticales (Gridlines) en gris claro
    ctx.font = '400 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let k = 0; k < numSteps; k++) {
      const gridVal = k * gridStep;
      const xPos = this.paddingLeft + (gridVal / rangeMax) * chartWidth;

      if (xPos > this.defaultWidth - this.paddingRight + 1) break;

      // Líneas de referencia muy tenues para no competir con las barras
      ctx.strokeStyle = k === 0 ? 'rgba(30, 41, 59, 0.25)' : 'rgba(30, 41, 59, 0.06)';
      ctx.lineWidth = k === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(xPos, this.paddingTop - 15);
      ctx.lineTo(xPos, this.defaultHeight - this.paddingBottom);
      ctx.stroke();

      // Valores numéricos del eje inferior
      ctx.fillStyle = '#64748b';
      ctx.fillText(gridVal.toLocaleString(), xPos, this.defaultHeight - this.paddingBottom + 12);
    }

    // 5. Renderizado de barras en 3D (Proyección Oblicua / Cavalier con caras sombreadas planas)
    const N = dataPoints.length;
    const spacing = chartHeight / N;
    // Espacio uniforme: el espacio vacío (gap) es ligeramente más estrecho que la barra en sí (la barra mide 62% del espacio)
    const barHeight = spacing * 0.62;

    // Parámetros de extrusión 3D (Ángulo 45° e inclinación de profundidad constante)
    const depth = 16;
    const dx = depth * Math.cos(Math.PI / 4);
    const dy = depth * Math.sin(Math.PI / 4);

    dataPoints.forEach((dp, i) => {
      const barY = this.paddingTop + i * spacing + (spacing - barHeight) / 2;
      const val = Math.max(0, dp.value);
      const barLength = rangeMax > 0 ? (val / rangeMax) * chartWidth : 0;
      const color = dp.highlight ? palette.accent : palette.base;

      // Dibujo de la etiqueta de la categoría a la izquierda (Texto horizontal sin rotación)
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1e293b';
      ctx.font = '500 13px Inter, sans-serif';

      // Recorta nombres excesivamente largos para no desbordar el eje
      let displayLabel = dp.label;
      if (ctx.measureText(displayLabel).width > this.paddingLeft - 30) {
        while (ctx.measureText(displayLabel + '...').width > this.paddingLeft - 30 && displayLabel.length > 0) {
          displayLabel = displayLabel.slice(0, -1);
        }
        displayLabel += '...';
      }
      ctx.fillText(displayLabel, this.paddingLeft - 15, barY + barHeight / 2);

      // Solo dibuja el bloque tridimensional si el valor es mayor a 0
      if (barLength > 0) {
        // A. Cara superior (Top Face) - Tono aclarado plano
        ctx.fillStyle = adjustColorBrightness(color, 0.15);
        ctx.beginPath();
        ctx.moveTo(this.paddingLeft, barY);
        ctx.lineTo(this.paddingLeft + dx, barY - dy);
        ctx.lineTo(this.paddingLeft + barLength + dx, barY - dy);
        ctx.lineTo(this.paddingLeft + barLength, barY);
        ctx.closePath();
        ctx.fill();

        // B. Cara lateral derecha (Right Face) - Tono oscurecido plano
        ctx.fillStyle = adjustColorBrightness(color, -0.15);
        ctx.beginPath();
        ctx.moveTo(this.paddingLeft + barLength, barY);
        ctx.lineTo(this.paddingLeft + barLength + dx, barY - dy);
        ctx.lineTo(this.paddingLeft + barLength + dx, barY + barHeight - dy);
        ctx.lineTo(this.paddingLeft + barLength, barY + barHeight);
        ctx.closePath();
        ctx.fill();

        // C. Cara frontal (Front Face) - Tono plano base
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.rect(this.paddingLeft, barY, barLength, barHeight);
        ctx.closePath();
        ctx.fill();

        // D. Bordes/Delineado sutil para definir las uniones 3D
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        // Frente
        ctx.rect(this.paddingLeft, barY, barLength, barHeight);
        // Techo
        ctx.moveTo(this.paddingLeft, barY);
        ctx.lineTo(this.paddingLeft + dx, barY - dy);
        ctx.lineTo(this.paddingLeft + barLength + dx, barY - dy);
        ctx.lineTo(this.paddingLeft + barLength, barY);
        // Costado
        ctx.moveTo(this.paddingLeft + barLength + dx, barY - dy);
        ctx.lineTo(this.paddingLeft + barLength + dx, barY + barHeight - dy);
        ctx.lineTo(this.paddingLeft + barLength, barY + barHeight);
        ctx.stroke();
      }

      // 6. Colocación de los valores numéricos exactos en el extremo de la barra 3D
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px Inter, sans-serif';

      const textX = this.paddingLeft + barLength + dx + 10;
      const textY = barY + barHeight / 2 - dy / 2; // Alineado al centro de la proyección 3D

      ctx.fillText(dp.value.toLocaleString(), textX, textY);
    });

    // Vuelve a trazar la línea del eje vertical de base cero en primer plano
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.paddingLeft, this.paddingTop - 15);
    ctx.lineTo(this.paddingLeft, this.defaultHeight - this.paddingBottom);
    ctx.stroke();
  }

  /**
   * Captura el contenido del lienzo de dibujo y fuerza la descarga local como una imagen PNG.
   */
  private triggerPNGDownload(): void {
    const dataURL = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');

    const name = this.titleInput.value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `reporte-grafico-${name || 'chart'}.png`;
    link.href = dataURL;
    link.click();
  }
}
