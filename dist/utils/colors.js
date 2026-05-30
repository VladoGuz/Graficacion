export const PALETTES = {
    blue: { base: '#3b82f6', accent: '#f97316' }, // Azul base, Destaque Naranja
    emerald: { base: '#10b981', accent: '#f43f5e' }, // Verde Esmeralda base, Destaque Coral/Rosa
    charcoal: { base: '#4b5563', accent: '#ef4444' }, // Gris oscuro base, Destaque Rojo
    amber: { base: '#f59e0b', accent: '#8b5cf6' } // Ámbar base, Destaque Púrpura
};
/**
 * Obtiene una paleta de colores por su nombre identificador.
 * Si la paleta no se encuentra, retorna la paleta azul por defecto.
 *
 * @param name Nombre de la paleta seleccionada.
 * @returns La paleta correspondiente.
 */
export function getPalette(name) {
    return PALETTES[name] || PALETTES.blue;
}
export function adjustColorBrightness(hex, percent) {
    let color = hex.replace(/^\s*#|\s*$/g, '');
    // Soporta formato hexadecimal corto (3 caracteres, ej. "F00")
    if (color.length === 3) {
        color = color.replace(/(.)/g, '$1$1');
    }
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
    // Convierte los componentes RGB a rango [0, 1]
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;
    // Realiza conversión a HSL
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    // Modifica el componente de luminosidad (L) dentro de los límites válidos [0, 1]
    l = Math.max(0, Math.min(1, l + percent));
    // Convierte de vuelta a formato RGB
    let rOut = 0;
    let gOut = 0;
    let bOut = 0;
    if (s === 0) {
        rOut = gOut = bOut = l; // Caso acromático (gris)
    }
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        rOut = hue2rgb(p, q, h + 1 / 3);
        gOut = hue2rgb(p, q, h);
        bOut = hue2rgb(p, q, h - 1 / 3);
    }
    // Convierte de vuelta a hexadecimal de 2 dígitos por componente
    const toHex = (x) => {
        const val = Math.round(x * 255).toString(16);
        return val.length === 1 ? '0' + val : val;
    };
    return `#${toHex(rOut)}${toHex(gOut)}${toHex(bOut)}`;
}
