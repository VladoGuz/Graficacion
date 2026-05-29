// Mapa de traducción de funciones en español e inglés al nombre interno estándar
const MAPA_FUNCIONES = {
    'sin': 'sin',
    'sen': 'sin', // Soporte en español
    'cos': 'cos',
    'tan': 'tan',
    'tg': 'tan', // Soporte en español (abreviación común)
    'tang': 'tan', // Soporte en español (abreviación alternativa)
    'sqrt': 'sqrt',
    'raiz': 'sqrt', // Soporte en español
    'raíz': 'sqrt', // Soporte en español con acento
    'exp': 'exp',
    'log': 'log',
    'ln': 'log',
    'abs': 'abs'
};
// Constantes matemáticas admitidas
const CONSTANTES = new Set(['pi', 'e']);
// Operadores con su precedencia y asociatividad
const OPERADORES = {
    '+': { precedence: 2, associativity: 'left' },
    '-': { precedence: 2, associativity: 'left' },
    '*': { precedence: 3, associativity: 'left' },
    '/': { precedence: 3, associativity: 'left' },
    '^': { precedence: 4, associativity: 'right' },
    'u-': { precedence: 5, associativity: 'right' } // Menos unario
};
/**
 * Clase encargada de analizar y evaluar expresiones matemáticas.
 * Utiliza el algoritmo Shunting-yard para pasar de infijo a RPN (Notación Polaca Inversa)
 * y evalúa la expresión para valores de x dados.
 */
export class MathParser {
    constructor(expresion) {
        this.rpn = [];
        // Saneamiento inicial de la expresión
        let expresionLimpia = expresion.trim();
        // 1. Quitar prefijos comunes de ecuación como "y =" o "f(x) ="
        expresionLimpia = expresionLimpia.replace(/^(f\s*\(\s*x\s*\)|y)\s*=\s*/i, '');
        // 2. Reemplazar la coma decimal por punto decimal para soporte en español
        expresionLimpia = expresionLimpia.replace(/,/g, '.');
        // 3. Eliminar todos los espacios en blanco restantes
        expresionLimpia = expresionLimpia.replace(/\s+/g, '');
        if (!expresionLimpia) {
            throw new Error('La expresión matemática no puede estar vacía.');
        }
        const tokens = this.tokenize(expresionLimpia);
        const tokensProcesados = this.insertarMultiplicacionImplicitaYUnario(tokens);
        this.rpn = this.shuntingYard(tokensProcesados);
    }
    /**
     * Divide la cadena de texto de la expresión en componentes léxicos (Tokens).
     */
    tokenize(expr) {
        const tokens = [];
        let i = 0;
        while (i < expr.length) {
            const char = expr[i];
            // Números decimales o enteros
            if (/[0-9.]/.test(char)) {
                let numStr = '';
                while (i < expr.length && /[0-9.]/.test(expr[i])) {
                    numStr += expr[i];
                    i++;
                }
                tokens.push({ type: 'NUMBER', value: numStr });
                continue;
            }
            // Operadores aritméticos y paréntesis
            if (['+', '-', '*', '/', '^', '(', ')'].indexOf(char) !== -1) {
                if (char === '(') {
                    tokens.push({ type: 'LPAREN', value: '(' });
                }
                else if (char === ')') {
                    tokens.push({ type: 'RPAREN', value: ')' });
                }
                else {
                    tokens.push({ type: 'OP', value: char });
                }
                i++;
                continue;
            }
            // Letras: variables, constantes o funciones (incluye soporte para acentos y eñe del español)
            if (/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(char)) {
                let name = '';
                while (i < expr.length && /[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ]/.test(expr[i])) {
                    name += expr[i];
                    i++;
                }
                const lowerName = name.toLowerCase();
                if (lowerName === 'x') {
                    tokens.push({ type: 'VAR', value: 'x' });
                }
                else if (CONSTANTES.has(lowerName)) {
                    tokens.push({ type: 'CONST', value: lowerName });
                }
                else if (lowerName in MAPA_FUNCIONES) {
                    tokens.push({ type: 'FUNC', value: MAPA_FUNCIONES[lowerName] });
                }
                else {
                    throw new Error(`Variable o función desconocida: "${name}"`);
                }
                continue;
            }
            throw new Error(`Carácter no válido en la expresión: "${char}"`);
        }
        return tokens;
    }
    /**
     * Identifica y convierte el signo menos unario y añade multiplicación implícita
     * donde el usuario omitió el operador '*' (por ejemplo, en "2x" o "2(x+1)").
     */
    insertarMultiplicacionImplicitaYUnario(tokens) {
        const result = [];
        for (let i = 0; i < tokens.length; i++) {
            const current = tokens[i];
            // Identificar el signo menos unario (u-)
            // Un menos '-' es unario si es el primer token de todos, o si sigue a un operador o a un paréntesis abierto
            if (current.type === 'OP' && current.value === '-') {
                const prev = i > 0 ? tokens[i - 1] : null;
                if (!prev || prev.type === 'OP' || prev.type === 'LPAREN') {
                    result.push({ type: 'UNARY_OP', value: 'u-' });
                    continue;
                }
            }
            // Insertar multiplicación implícita
            // Colocamos un '*' si pasamos de un token de la izquierda a uno de la derecha:
            // Izquierda (NUMBER, CONST, VAR, RPAREN) -> Derecha (VAR, CONST, FUNC, LPAREN)
            if (i > 0) {
                const prev = result[result.length - 1]; // Observamos el último token insertado en el resultado
                const isPrevLeft = prev.type === 'NUMBER' ||
                    prev.type === 'CONST' ||
                    prev.type === 'VAR' ||
                    prev.type === 'RPAREN';
                const isCurrRight = current.type === 'VAR' ||
                    current.type === 'CONST' ||
                    current.type === 'FUNC' ||
                    current.type === 'LPAREN';
                if (isPrevLeft && isCurrRight) {
                    result.push({ type: 'OP', value: '*' });
                }
            }
            result.push(current);
        }
        return result;
    }
    /**
     * Implementa el algoritmo Shunting-yard para convertir los tokens en infijo
     * a Notación Polaca Inversa (RPN).
     */
    shuntingYard(tokens) {
        const outputQueue = [];
        const operatorStack = [];
        for (const token of tokens) {
            if (token.type === 'NUMBER' || token.type === 'VAR' || token.type === 'CONST') {
                outputQueue.push(token);
            }
            else if (token.type === 'FUNC') {
                operatorStack.push(token);
            }
            else if (token.type === 'OP' || token.type === 'UNARY_OP') {
                let top = operatorStack[operatorStack.length - 1];
                const tokPrec = OPERADORES[token.value].precedence;
                const tokAssoc = OPERADORES[token.value].associativity;
                while (top &&
                    (top.type === 'OP' || top.type === 'UNARY_OP' || top.type === 'FUNC') &&
                    (top.type === 'FUNC' ||
                        (OPERADORES[top.value].precedence > tokPrec ||
                            (OPERADORES[top.value].precedence === tokPrec && tokAssoc === 'left')))) {
                    outputQueue.push(operatorStack.pop());
                    top = operatorStack[operatorStack.length - 1];
                }
                operatorStack.push(token);
            }
            else if (token.type === 'LPAREN') {
                operatorStack.push(token);
            }
            else if (token.type === 'RPAREN') {
                let top = operatorStack[operatorStack.length - 1];
                while (top && top.type !== 'LPAREN') {
                    outputQueue.push(operatorStack.pop());
                    top = operatorStack[operatorStack.length - 1];
                }
                if (!top) {
                    throw new Error('Paréntesis no emparejados: sobra un paréntesis de cierre');
                }
                operatorStack.pop(); // Quitar el '('
                // Si hay una función en la cima de la pila, va a la cola de salida
                if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNC') {
                    outputQueue.push(operatorStack.pop());
                }
            }
        }
        while (operatorStack.length > 0) {
            const top = operatorStack.pop();
            if (top.type === 'LPAREN') {
                throw new Error('Paréntesis no emparejados: falta un paréntesis de cierre');
            }
            outputQueue.push(top);
        }
        return outputQueue;
    }
    /**
     * Evalúa la expresión matemática en notación RPN reemplazando la variable X.
     */
    evaluate(x) {
        const stack = [];
        for (const token of this.rpn) {
            if (token.type === 'NUMBER') {
                stack.push(parseFloat(token.value));
            }
            else if (token.type === 'VAR') {
                stack.push(x);
            }
            else if (token.type === 'CONST') {
                if (token.value === 'pi') {
                    stack.push(Math.PI);
                }
                else if (token.value === 'e') {
                    stack.push(Math.E);
                }
            }
            else if (token.type === 'UNARY_OP') {
                if (stack.length < 1)
                    throw new Error('Error al evaluar operador unitario.');
                const val = stack.pop();
                stack.push(-val);
            }
            else if (token.type === 'OP') {
                if (stack.length < 2)
                    throw new Error('Error de sintaxis: faltan operandos.');
                const b = stack.pop();
                const a = stack.pop();
                switch (token.value) {
                    case '+':
                        stack.push(a + b);
                        break;
                    case '-':
                        stack.push(a - b);
                        break;
                    case '*':
                        stack.push(a * b);
                        break;
                    case '/':
                        stack.push(a / b);
                        break;
                    case '^':
                        stack.push(Math.pow(a, b));
                        break;
                    default: throw new Error(`Operador desconocido: ${token.value}`);
                }
            }
            else if (token.type === 'FUNC') {
                if (stack.length < 1)
                    throw new Error(`Falta el argumento para la función: "${token.value}"`);
                const val = stack.pop();
                switch (token.value) {
                    case 'sin':
                        stack.push(Math.sin(val));
                        break;
                    case 'cos':
                        stack.push(Math.cos(val));
                        break;
                    case 'tan':
                        stack.push(Math.tan(val));
                        break;
                    case 'sqrt':
                        stack.push(Math.sqrt(val));
                        break;
                    case 'exp':
                        stack.push(Math.exp(val));
                        break;
                    case 'log':
                        stack.push(Math.log(val));
                        break; // ln y log mapean a logaritmo natural
                    case 'abs':
                        stack.push(Math.abs(val));
                        break;
                    default: throw new Error(`Función no implementada: ${token.value}`);
                }
            }
        }
        if (stack.length !== 1) {
            throw new Error('Error de sintaxis: la expresión no se pudo evaluar a un único valor.');
        }
        return stack[0];
    }
}
