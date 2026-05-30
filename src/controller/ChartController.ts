import { ChartModel } from '../model/ChartModel.js';
import { ChartView } from '../view/ChartView.js';

export class ChartController {
  constructor(private model: ChartModel, private view: ChartView) {

    this.model.subscribe(() => {
      this.view.render(this.model);
    });

    //  Vincula el evento "Añadir Fila" a la creación de un nuevo punto de datos con valores por defecto
    this.view.bindAddRow(() => {
      this.model.addDataPoint('', 0, false);
    });

    //  Vincula el botón de restablecimiento a cargar el set de demostración
    this.view.bindLoadSample(() => {
      this.model.loadSampleData();
    });

    //Vincula el botón de vaciar gráfico
    this.view.bindClear(() => {
      this.model.clearData();
    });

    //  Vincula el cambio del título de la barra superior al modelo
    this.view.bindTitleChange((title) => {
      this.model.setTitle(title);
    });

    //. Vincula el cambio de subtítulo/unidades al modelo
    this.view.bindSubtitleChange((subtitle) => {
      this.model.setSubtitle(subtitle);
    });

    //Vincula el cambio de selección del selector de paleta de colores al modelo
    this.view.bindPaletteChange((paletteName) => {
      this.model.setPaletteName(paletteName);
    });

    // Vincula los eventos interactivos de modificación e inline-deletion de la tabla de datos
    this.view.bindTableEvents(
      (id, label, value, highlight) => {
        this.model.updateDataPoint(id, label, value, highlight);
      },
      (id) => {
        this.model.removeDataPoint(id);
      }
    );
  }
}
