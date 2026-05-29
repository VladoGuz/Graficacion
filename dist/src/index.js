import { PlotterModel } from './model/PlotterModel.js';
import { CanvasView } from './view/CanvasView.js';
import { SidebarView } from './view/SidebarView.js';
import { PlotterController } from './controller/PlotterController.js';
// --- ELEMENTOS DEL DOM ---
const canvas = document.getElementById('circlechart');
// Formulario de agregar función y campos
const form = document.getElementById('add-func-form');
const funcInput = document.getElementById('func-input');
const funcColor = document.getElementById('func-color');
const errorFeedback = document.getElementById('func-error');
const errorMessage = document.getElementById('error-message');
const functionsListContainer = document.getElementById('functions-list');
// Botones de controles de vista
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const btnReset = document.getElementById('btn-reset');
// Elementos de rangos de coordenadas
const rangeXText = document.getElementById('range-x-text');
const rangeYText = document.getElementById('range-y-text');
// Elementos de coordenadas bajo el cursor
const coordX = document.getElementById('coord-x');
const coordY = document.getElementById('coord-y');
// --- PALETA DE COLORES ---
// Colores dinámicos para asignarse por defecto a las funciones añadidas
const PALETTE = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
let colorIndex = 0;
/**
 * Devuelve el siguiente color de la paleta y actualiza el puntero rotativamente.
 */
function getNextColor() {
    const color = PALETTE[colorIndex];
    colorIndex = (colorIndex + 1) % PALETTE.length;
    return color;
}
// --- INICIALIZACIÓN DE COMPONENTES MVC ---
const model = new PlotterModel();
const canvasView = new CanvasView(canvas, model);
const sidebarView = new SidebarView(model, functionsListContainer, rangeXText, rangeYText, errorFeedback, errorMessage, coordX, coordY);
// Inicializar el controlador para enlazar los eventos del usuario
new PlotterController(model, canvasView, sidebarView, form, funcInput, funcColor, btnZoomIn, btnZoomOut, btnReset, canvas, getNextColor);
/**
 * Ajusta el tamaño lógico del canvas con respecto a su contenedor físico de diseño CSS,
 * y le indica al modelo que ajuste la relación de aspecto del visor.
 */
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    model.adjustAspectRatio(canvas.width, canvas.height);
}
// Configurar el evento resize para redimensionar el canvas de manera fluida y responsiva
window.addEventListener('resize', resizeCanvas);
// Primera llamada para inicializar el tamaño del lienzo
resizeCanvas();
// Cargar funciones matemáticas predeterminadas de bienvenida
try {
    model.addFunction('x^2', '#f43f5e'); // Rosa neón
}
catch (e) {
    console.error('Error al inicializar las funciones por defecto:', e);
}
// Establecer el color de inicio del selector de color de interfaz
funcColor.value = getNextColor();
