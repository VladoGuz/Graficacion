# Graficador de Funciones


## Características

- **Interacción Fluida**:
  - Desplazamiento en el plano cartesiano con el mosue (manteniendo pulsado el click izuierdo)
  - Zoom utilizando la rueda de desplazamiento del mouse (*scroll*).
- **Intérprete Matemático Integrado (`MathParser.ts`)**:
 
- **Gestión de Funciones**:
  - Graficación de múltiples funciones simultáneas.
  - Selector de colores personalizado para cada gráfica.
  - Botones de acceso rápido (*presets*) para funciones comunes.


---

## Cómo Ejecutar el Proyecto Localmente

Para compilar y ejecutar este proyecto en tu entorno local, sigue estos sencillos pasos:

### Requisitos Previos

Asegúrate de tener instalado **Node.js** (versión 14 o superior) en tu sistema.

---

### Paso 1: Compilar el código TypeScript

Dado que el proyecto utiliza TypeScript y compila el código resultante dentro de la carpeta `dist/src/`, es necesario transpilar los archivos `.ts` a JavaScript.

1. Abre una terminal dentro del directorio raíz del proyecto (`Graficacion/`).
2. Ejecuta el compilador de TypeScript en modo observación (*watch mode*):
   ```bash
   npx tsc -w
   ```
   *Nota: Este comando mantendrá la terminal ocupada escuchando cambios en tus archivos TypeScript y los compilará automáticamente en tiempo real.*

---

### Paso 2: Ejecutar en el Navegador

Una vez que se haya generado el archivo transpilado en `dist/src/index.js`, puedes abrir y ver el proyecto utilizando cualquiera de los siguientes métodos:

#### Opción A: Abrir el archivo directamente (Sin servidor)
Desde el explorador de archivos de tu sistema operativo para abrirlo directamente en tu navegador web favorito.

#### Opción B: Extensión Live Server de VS Code
Si utilizas **Visual Studio Code**, puedes hacer clic derecho sobre el archivo `index.html` y seleccionar **"Open with Live Server"** (requiere tener instalada la extensión *Live Server*).