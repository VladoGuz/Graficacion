import { ChartModel } from './model/ChartModel.js';
import { ChartView } from './view/ChartView.js';
import { ChartController } from './controller/ChartController.js';
const init = () => {
    const model = new ChartModel();
    const view = new ChartView();
    new ChartController(model, view);
    view.render(model);
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}
