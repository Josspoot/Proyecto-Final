let points = [];
let currentRange = 10;

// ========== CONSTANTES MATEMÁTICAS ==========
const CONSTANTS = {
  // Constantes básicas
  π: Math.PI,
  pi: Math.PI,
  e: Math.E,

  // Número áureo (phi)
  φ: (1 + Math.sqrt(5)) / 2,
  phi: (1 + Math.sqrt(5)) / 2,

  // Tau (2π)
  τ: 2 * Math.PI,
  tau: 2 * Math.PI,

  // Logaritmos naturales
  ln2: Math.LN2,
  ln10: Math.LN10,

  // Raíces cuadradas comunes
  "√2": Math.sqrt(2),
  "√3": Math.sqrt(3),
  "√5": Math.sqrt(5),
  "√7": Math.sqrt(7),
  "√8": Math.sqrt(8),
  "√10": Math.sqrt(10),
  "√11": Math.sqrt(11),
  "√12": Math.sqrt(12),
  "√13": Math.sqrt(13),
  "√15": Math.sqrt(15),
  "√17": Math.sqrt(17),
  "√19": Math.sqrt(19),
  "√20": Math.sqrt(20),

  // Raíces cuadradas negativas
  "-√2": -Math.sqrt(2),
  "-√3": -Math.sqrt(3),
  "-√5": -Math.sqrt(5),
};

// ========== FUNCIONES DE PARSING DE NÚMEROS ==========

/**
 * Función principal para convertir texto en número
 * Maneja constantes, fracciones, raíces y expresiones básicas
 * @param {string} input - La expresión matemática ingresada
 * @returns {number|null} - El valor numérico o null si es inválida
 */
function parseNumber(input) {
  // Limpiar el input de espacios en blanco
  input = input.trim().replace(/\s+/g, "");

  // Verificar si es una constante matemática directa
  if (CONSTANTS.hasOwnProperty(input)) {
    return CONSTANTS[input];
  }

  // Reemplazar constantes matemáticas en la expresión
  let processedInput = input;
  for (const [symbol, value] of Object.entries(CONSTANTS)) {
    // Crear expresión regular para reemplazar el símbolo
    const regex = new RegExp(
      symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "g"
    );
    processedInput = processedInput.replace(regex, value.toString());
  }

  // Manejar fracciones simples (sin otros operadores)
  if (
    input.includes("/") &&
    !input.includes("*") &&
    !input.includes("+") &&
    !input.includes("-", 1)
  ) {
    const parts = input.split("/");
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);

      // Verificar que ambos son números válidos y denominador no es cero
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
  }

  // Manejar raíces cuadradas básicas con símbolo √ (sin otros operadores)
  if (
    input.startsWith("√") &&
    !input.includes("*") &&
    !input.includes("+") &&
    !input.includes("-", 1)
  ) {
    const radicand = parseFloat(input.slice(1));
    if (!isNaN(radicand) && radicand >= 0) {
      return Math.sqrt(radicand);
    }
  }

  // Manejar raíces cuadradas negativas
  if (input.startsWith("-√") && !input.includes("*") && !input.includes("+")) {
    const radicand = parseFloat(input.slice(2));
    if (!isNaN(radicand) && radicand >= 0) {
      return -Math.sqrt(radicand);
    }
  }

  // Manejar función sqrt() con cualquier expresión dentro
  if (input.includes("sqrt(")) {
    // Patrón para encontrar sqrt(cualquier expresión)
    const sqrtPattern = /sqrt\(([^)]+)\)/g;
    let processedInputSqrt = input;
    let match;

    // Procesar todas las ocurrencias de sqrt()
    while ((match = sqrtPattern.exec(input)) !== null) {
      const innerExpression = match[1];
      let innerValue;

      // Evaluar la expresión dentro del sqrt()
      try {
        // Para fracciones simples dentro de sqrt()
        if (
          innerExpression.includes("/") &&
          !innerExpression.includes("*") &&
          !innerExpression.includes("+") &&
          !innerExpression.includes("-", 1)
        ) {
          const parts = innerExpression.split("/");
          if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
              innerValue = num / den;
            }
          }
        } else {
          // Para otras expresiones, evaluar directamente
          const safeChars = /^[0-9+\-*/.() ]+$/;
          if (safeChars.test(innerExpression)) {
            innerValue = Function(
              '"use strict"; return (' + innerExpression + ")"
            )();
          } else {
            innerValue = parseFloat(innerExpression);
          }
        }

        // Si el valor interno es válido, calcular su raíz cuadrada
        if (!isNaN(innerValue) && innerValue >= 0) {
          const sqrtValue = Math.sqrt(innerValue);
          processedInputSqrt = processedInputSqrt.replace(
            match[0],
            sqrtValue.toString()
          );
        }
      } catch (e) {
        // Si falla la evaluación, continuar con el siguiente
        continue;
      }
    }

    // Si la entrada era solo una raíz simple, devolver el resultado directamente
    if (/^sqrt\([^)]+\)$/.test(input)) {
      const innerExpression = input.match(/sqrt\(([^)]+)\)/)[1];
      let innerValue;

      try {
        // Para fracciones dentro de sqrt()
        if (
          innerExpression.includes("/") &&
          !innerExpression.includes("*") &&
          !innerExpression.includes("+") &&
          !innerExpression.includes("-", 1)
        ) {
          const parts = innerExpression.split("/");
          if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
              innerValue = num / den;
            }
          }
        } else {
          // Para expresiones o números simples
          const safeChars = /^[0-9+\-*/.() ]+$/;
          if (safeChars.test(innerExpression)) {
            innerValue = Function(
              '"use strict"; return (' + innerExpression + ")"
            )();
          } else {
            innerValue = parseFloat(innerExpression);
          }
        }

        // Retornar la raíz cuadrada si es válida
        if (!isNaN(innerValue) && innerValue >= 0) {
          return Math.sqrt(innerValue);
        }
      } catch (e) {
        // Si falla la evaluación, continuar con el flujo normal
      }
    }

    // Si había múltiples sqrt() o expresiones complejas, usar el input procesado
    input = processedInputSqrt;
  }

  // Evaluar expresiones matemáticas más complejas
  try {
    // Reemplazar operadores por equivalentes de JavaScript
    processedInput = processedInput.replace(/\^/g, "**"); // Potencias

    // Verificar que solo contiene caracteres seguros para evaluar
    const safeChars = /^[0-9+\-*/.() ]+$/;
    if (safeChars.test(processedInput)) {
      const result = Function(
        '"use strict"; return (' + processedInput + ")"
      )();
      if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
        return result;
      }
    }
  } catch (e) {
    // Si falla la evaluación, continuar con el parsing normal
  }

  // Intentar parsear como número decimal normal
  const num = parseFloat(processedInput);
  if (!isNaN(num)) {
    return num;
  }

  // Si nada funcionó, retornar null
  return null;
}

// ========== FUNCIONES DE NORMALIZACIÓN Y CLASIFICACIÓN ==========

/**
 * Normaliza una expresión matemática para facilitar el análisis
 * @param {string} expr - La expresión a normalizar
 * @returns {string} - La expresión normalizada
 */
function normalizeExpression(expr) {
  return expr
    .replace(/\s/g, "") // Remover espacios
    .replace(/\*\*/g, "^") // Convertir ** a ^
    .toLowerCase(); // Convertir a minúsculas para pi, e, etc.
}

/**
 * Clasifica expresiones matemáticas complejas
 * @param {string} expression - La expresión matemática original
 * @param {number} result - El resultado numérico de la expresión
 * @returns {string} - El tipo de número ('naturals', 'integers', 'rationals', 'irrationals')
 */
function classifyExpression(expression, result) {
  const normalizedExpr = normalizeExpression(expression);

  // Casos muy específicos donde sabemos que el resultado es racional
  const knownRationalResults = [
    // División de iguales = 1
    { pattern: /^π\/π$/, result: 1 },
    { pattern: /^pi\/pi$/, result: 1 },
    { pattern: /^e\/e$/, result: 1 },
    { pattern: /^φ\/φ$/, result: 1 },
    { pattern: /^phi\/phi$/, result: 1 },
    { pattern: /^τ\/τ$/, result: 1 },
    { pattern: /^tau\/tau$/, result: 1 },
    { pattern: /^√2\/√2$/, result: 1 },
    { pattern: /^√3\/√3$/, result: 1 },
    { pattern: /^√5\/√5$/, result: 1 },

    // Resta de iguales = 0
    { pattern: /^π-π$/, result: 0 },
    { pattern: /^pi-pi$/, result: 0 },
    { pattern: /^e-e$/, result: 0 },

    // Casos especiales conocidos
    { pattern: /^2\*π\/τ$/, result: 1 },
    { pattern: /^τ\/2\*π$/, result: 1 },
  ];

  // Verificar casos conocidos que resultan en números racionales
  for (const knownCase of knownRationalResults) {
    if (knownCase.pattern.test(normalizedExpr)) {
      if (Math.abs(result - knownCase.result) < 0.0001) {
        if (knownCase.result > 0 && Number.isInteger(knownCase.result)) {
          return "naturals";
        }
        if (Number.isInteger(knownCase.result)) {
          return "integers";
        }
        return "rationals";
      }
    }
  }

  // Casos especiales donde el resultado es racional/entero a pesar de involucrar irracionales
  const specialRationalCases = [
    // Casos que resultan en 1
    /π\/π/,
    /pi\/pi/,
    /e\/e/,
    /φ\/φ/,
    /phi\/phi/,
    /τ\/τ/,
    /tau\/tau/,
    /√2\/√2/,
    /√3\/√3/,
    /√5\/√5/,

    // Casos que resultan en números racionales conocidos
    /π\/-π/,
    /pi\/-pi/,
    /e\/-e/,
    /φ\/-φ/,
    /phi\/-phi/,
    /-π\/π/,
    /-pi\/pi/,
    /-e\/e/,
    /-φ\/φ/,
    /-phi\/phi/,

    // Casos como e/2e = 0.5 (necesitamos ser más específicos)
    /e\/2\*e/,
    /π\/2\*π/,
    /pi\/2\*pi/,
  ];

  // Verificar casos especiales que dan resultados racionales
  for (const pattern of specialRationalCases) {
    if (pattern.test(expression.replace(/\s/g, ""))) {
      // Si el resultado es un entero positivo, es natural
      if (result > 0 && Number.isInteger(result)) {
        return "naturals";
      }
      // Si es entero, es entero
      if (Number.isInteger(result)) {
        return "integers";
      }
      // Si no, es racional
      return "rationals";
    }
  }

  // Lista de símbolos irracionales para detectar en expresiones
  const irrationalSymbols = [
    "π",
    "pi",
    "e",
    "φ",
    "phi",
    "τ",
    "tau",
    "ln2",
    "ln10",
    "√",
    "sqrt",
  ];

  // Verificar si la expresión contiene números irracionales
  const containsIrrationals = irrationalSymbols.some((symbol) =>
    expression.includes(symbol)
  );

  if (containsIrrationals) {
    // Casos especiales donde suma/resta de irracionales puede dar resultado racional
    const rationalResultPatterns = [
      // Casos como π + (-π) = 0, e - e = 0
      /π\+\(-π\)/,
      /pi\+\(-pi\)/,
      /e\+\(-e\)/,
      /φ\+\(-φ\)/,
      /phi\+\(-phi\)/,
      /π-π/,
      /pi-pi/,
      /e-e/,
      /φ-φ/,
      /phi-phi/,
      /τ-τ/,
      /tau-tau/,
      /√2-√2/,
      /√3-√3/,
      /√5-√5/,

      // Otros casos especiales conocidos
      /2\*π\/τ/,
      /2\*pi\/tau/,
      /τ\/2\*π/,
      /tau\/2\*pi/,
    ];

    // Verificar si es un caso especial que da resultado racional
    const isSpecialRational = rationalResultPatterns.some((pattern) =>
      pattern.test(expression.replace(/\s/g, ""))
    );

    if (isSpecialRational) {
      if (result > 0 && Number.isInteger(result)) {
        return "naturals";
      }
      if (Number.isInteger(result)) {
        return "integers";
      }
      return "rationals";
    }

    // Si contiene irracionales y no es un caso especial, probablemente es irracional
    return "irrationals";
  }

  // Si no contiene irracionales, clasificar normalmente por el resultado
  if (result > 0 && Number.isInteger(result)) {
    return "naturals";
  }
  if (Number.isInteger(result)) {
    return "integers";
  }
  return "rationals";
}

/**
 * Clasifica un número según su tipo matemático
 * @param {number} num - El valor numérico a clasificar
 * @param {string} originalInput - La expresión original ingresada
 * @returns {string} - El tipo de número ('naturals', 'integers', 'rationals', 'irrationals')
 */
function classifyNumber(num, originalInput) {
  // Verificar si es un número natural (entero positivo)
  if (num > 0 && Number.isInteger(num)) {
    return "naturals";
  }

  // Verificar si es un número entero
  if (Number.isInteger(num)) {
    return "integers";
  }

  // Lista de constantes irracionales conocidas
  const irrationalConstants = [
    "π",
    "pi",
    "e",
    "φ",
    "phi",
    "τ",
    "tau",
    "ln2",
    "ln10",
    "√2",
    "√3",
    "√5",
    "√7",
    "√8",
    "√10",
    "√11",
    "√12",
    "√13",
    "√15",
    "√17",
    "√19",
    "√20",
    "-√2",
    "-√3",
    "-√5",
  ];

  // Si es una constante irracional directa
  if (irrationalConstants.includes(originalInput)) {
    return "irrationals";
  }

  // Verificar si contiene sqrt() y clasificar según el contenido
  if (originalInput.includes("sqrt(")) {
    const sqrtMatch = originalInput.match(/sqrt\(([^)]+)\)/);
    if (sqrtMatch) {
      const innerExpression = sqrtMatch[1];
      let innerValue;

      try {
        // Evaluar lo que está dentro del sqrt()
        if (
          innerExpression.includes("/") &&
          !innerExpression.includes("*") &&
          !innerExpression.includes("+") &&
          !innerExpression.includes("-", 1)
        ) {
          // Fracción simple
          const parts = innerExpression.split("/");
          if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
              innerValue = num / den;
            }
          }
        } else {
          // Expresión o número simple
          const safeChars = /^[0-9+\-*/.() ]+$/;
          if (safeChars.test(innerExpression)) {
            innerValue = Function(
              '"use strict"; return (' + innerExpression + ")"
            )();
          } else {
            innerValue = parseFloat(innerExpression);
          }
        }

        if (!isNaN(innerValue) && innerValue >= 0) {
          const sqrtResult = Math.sqrt(innerValue);

          // Verificar si es un cuadrado perfecto
          const isInteger = Number.isInteger(sqrtResult);

          if (isInteger) {
            // Es cuadrado perfecto
            if (sqrtResult > 0) {
              return "naturals";
            } else if (sqrtResult === 0) {
              return "integers";
            }
          } else {
            // No es cuadrado perfecto, es irracional
            return "irrationals";
          }
        }
      } catch (e) {
        // Si hay error en la evaluación, asumir que es irracional
        return "irrationals";
      }
    }
  }

  // Analizar expresiones con operaciones matemáticas
  if (
    originalInput.includes("*") ||
    originalInput.includes("+") ||
    originalInput.includes("-") ||
    originalInput.includes("/")
  ) {
    return classifyExpression(originalInput, num);
  }

  // Verificar si es una fracción simple (racional)
  if (originalInput.includes("/")) {
    return "rationals";
  }

  // Si es decimal, asumimos que es racional a menos que se especifique lo contrario
  return "rationals";
}

/**
 * Obtiene el nombre completo de la clasificación matemática
 * @param {string} classification - El tipo de clasificación
 * @returns {string} - El nombre completo con símbolo matemático
 */
function getClassificationName(classification) {
  const names = {
    naturals: "ℕ (Naturales)",
    integers: "ℤ (Enteros)",
    rationals: "ℚ (Racionales)",
    irrationals: "ℝ-ℚ (Irracionales)",
  };
  return names[classification] || "No clasificado";
}

// ========== FUNCIONES DE INTERFAZ DE USUARIO ==========

/**
 * Agrega un número desde el input principal
 * Valida el formato, rango y duplicados antes de agregar
 */
function addNumber() {
  const input = document.getElementById("numberInput").value;

  if (!input) {
    alert("Por favor ingresa un número");
    return;
  }

  const value = parseNumber(input);
  if (value === null) {
    alert(
      "Formato de número no válido. Ejemplos válidos: sqrt(7), 2*π, 1/e, √2, -1/2"
    );
    return;
  }

  if (Math.abs(value) > currentRange) {
    alert(
      `El número está fuera del rango actual (-${currentRange} a ${currentRange}). Cambia el rango de visualización.`
    );
    return;
  }

  // Verificar si el punto ya existe (con tolerancia para errores de punto flotante)
  const existingPoint = points.find((p) => Math.abs(p.value - value) < 0.0001);
  if (existingPoint) {
    alert("Este número ya está en la recta numérica");
    return;
  }

  // Clasificar el número y agregarlo al array
  const classification = classifyNumber(value, input);

  points.push({
    value: value,
    originalInput: input,
    classification: classification,
  });

  // Limpiar el input y actualizar la visualización
  document.getElementById("numberInput").value = "";
  updateDisplay();
}

/**
 * Agrega un número predefinido desde los botones
 * @param {string} input - La expresión del número predefinido
 */
function addPresetNumber(input) {
  const value = parseNumber(input);

  if (value === null || Math.abs(value) > currentRange) {
    alert(`El número ${input} está fuera del rango actual`);
    return;
  }

  // Verificar si el punto ya existe
  const existingPoint = points.find((p) => Math.abs(p.value - value) < 0.0001);
  if (existingPoint) {
    alert("Este número ya está en la recta numérica");
    return;
  }

  // Clasificar el número y agregarlo
  const classification = classifyNumber(value, input);

  points.push({
    value: value,
    originalInput: input,
    classification: classification,
  });

  // Actualizar la visualización
  updateDisplay();
}

/**
 * Elimina todos los puntos de la recta numérica
 */
function clearAll() {
  points = [];
  updateDisplay();
}

/**
 * Actualiza toda la visualización (recta, lista y selectores)
 */
function updateDisplay() {
  drawNumberLine();
  updatePointsList();
  updateDistanceSelectors();
}

// ========== FUNCIONES DE VISUALIZACIÓN ==========

/**
 * Dibuja la recta numérica con todas las marcas y puntos
 */
function drawNumberLine() {
  const numberLine = document.getElementById("numberLine");
  numberLine.innerHTML = "";

  // Crear la línea base de la recta
  const line = document.createElement("div");
  line.className = "line";
  numberLine.appendChild(line);

  // Crear marcas de graduación
  const tickCount = currentRange * 2 + 1; // De -range a +range
  for (let i = 0; i < tickCount; i++) {
    const value = -currentRange + i;
    const percentage = (i / (tickCount - 1)) * 90 + 5; // 5% de margen a cada lado

    // Crear la marca vertical
    const tick = document.createElement("div");
    tick.className = "tick";
    tick.style.left = percentage + "%";
    numberLine.appendChild(tick);

    // Crear la etiqueta numérica
    const label = document.createElement("div");
    label.className = "tick-label";
    label.style.left = percentage + "%";
    label.textContent = value;
    numberLine.appendChild(label);
  }

  // Agregar los puntos de números agregados
  points.forEach((point, index) => {
    const percentage =
      ((point.value + currentRange) / (2 * currentRange)) * 90 + 5;

    // Crear el elemento visual del punto
    const pointElement = document.createElement("div");
    pointElement.className = `number-point ${point.classification}`;
    pointElement.style.left = percentage + "%";
    pointElement.draggable = false;

    // Crear la etiqueta del punto
    const pointLabel = document.createElement("div");
    pointLabel.className = "point-label";
    pointLabel.textContent = `${point.originalInput} ≈ ${point.value.toFixed(
      3
    )}`;
    pointElement.appendChild(pointLabel);

    // Agregar evento de clic para eliminar
    pointElement.onclick = () => removePoint(index);
    pointElement.title = `${point.originalInput} (${getClassificationName(
      point.classification
    )})\nHaz clic para eliminar`;

    numberLine.appendChild(pointElement);
  });
}

/**
 * Elimina un punto específico de la recta
 * @param {number} index - El índice del punto a eliminar
 */
function removePoint(index) {
  if (confirm("¿Deseas eliminar este punto?")) {
    points.splice(index, 1);
    updateDisplay();
  }
}

/**
 * Actualiza la lista de puntos ordenada por valor
 */
function updatePointsList() {
  const pointsList = document.getElementById("pointsList");

  // Si no hay puntos, mostrar mensaje informativo
  if (points.length === 0) {
    pointsList.innerHTML =
      '<p style="color: #6c757d; font-style: italic;">Agrega números para ver su clasificación aquí</p>';
    return;
  }

  // Ordenar puntos por valor de menor a mayor
  const sortedPoints = [...points].sort((a, b) => a.value - b.value);

  // Generar HTML para cada punto
  pointsList.innerHTML = sortedPoints
    .map(
      (point) => `
        <div class="point-item" style="border-left-color: ${getClassificationColor(
          point.classification
        )}">
            <div>
                <strong>${point.originalInput}</strong> ≈ ${point.value.toFixed(
        6
      )}
                <br>
                <small>${getClassificationName(point.classification)}</small>
            </div>
            <div style="text-align: right;">
                <small>Posición: ${point.value.toFixed(3)}</small>
            </div>
        </div>
    `
    )
    .join("");
}

/**
 * Obtiene el color asociado a cada tipo de número
 * @param {string} classification - El tipo de clasificación
 * @returns {string} - El código de color hexadecimal
 */
function getClassificationColor(classification) {
  const colors = {
    naturals: "#e74c3c",
    integers: "#f39c12",
    rationals: "#27ae60",
    irrationals: "#8e44ad",
  };
  return colors[classification] || "#3498db";
}

// ========== CALCULADORA DE DISTANCIAS ==========

/**
 * Actualiza los selectores de la calculadora de distancias
 */
function updateDistanceSelectors() {
  const pointAItems = document.getElementById("pointA-items");
  const pointBItems = document.getElementById("pointB-items");
  const pointASelected = document.getElementById("pointA-selected");
  const pointBSelected = document.getElementById("pointB-selected");

  // Limpiar las opciones existentes
  pointAItems.innerHTML = '<div data-value="">Selecciona un punto</div>';
  pointBItems.innerHTML = '<div data-value="">Selecciona un punto</div>';

  // Resetear el texto seleccionado si no hay puntos
  if (points.length === 0) {
    pointASelected.textContent = "Selecciona un punto";
    pointBSelected.textContent = "Selecciona un punto";
    document.getElementById("pointA-container").setAttribute("data-value", "");
    document.getElementById("pointB-container").setAttribute("data-value", "");
    return;
  }

  // Agregar cada punto como opción en ambos selectores
  points.forEach((point, index) => {
    const optionText = `${point.originalInput} (${point.value.toFixed(3)})`;

    // Crear opción para el selector A
    const optionA = document.createElement("div");
    optionA.setAttribute("data-value", index);
    optionA.textContent = optionText;
    pointAItems.appendChild(optionA);

    // Crear opción para el selector B
    const optionB = document.createElement("div");
    optionB.setAttribute("data-value", index);
    optionB.textContent = optionText;
    pointBItems.appendChild(optionB);
  });
}

/**
 * Calcula la distancia entre dos puntos seleccionados
 */
function calculateDistance() {
  const pointAValue = document
    .getElementById("pointA-container")
    .getAttribute("data-value");
  const pointBValue = document
    .getElementById("pointB-container")
    .getAttribute("data-value");
  const resultDiv = document.getElementById("distanceResult");

  // Verificar que ambos puntos estén seleccionados
  if (!pointAValue || !pointBValue) {
    resultDiv.innerHTML =
      '<div style="color: #dc3545;">Selecciona ambos puntos para calcular la distancia</div>';
    return;
  }

  // Verificar que los puntos sean diferentes
  if (pointAValue === pointBValue) {
    resultDiv.innerHTML =
      '<div style="color: #dc3545;">Selecciona dos puntos diferentes</div>';
    return;
  }

  // Obtener los puntos seleccionados
  const pointA = points[parseInt(pointAValue)];
  const pointB = points[parseInt(pointBValue)];

  // Calcular la distancia como valor absoluto de la diferencia
  const distance = Math.abs(pointA.value - pointB.value);

  // Mostrar el resultado formateado
  resultDiv.innerHTML = `
        <div class="distance-result">
            <strong>Distancia entre ${pointA.originalInput} y ${
    pointB.originalInput
  }:</strong><br>
            |${pointA.value.toFixed(3)} - ${pointB.value.toFixed(
    3
  )}| = ${distance.toFixed(6)} unidades
        </div>
    `;
}

// ========== SELECTORES PERSONALIZADOS ==========

/**
 * Inicializa los selectores personalizados para la calculadora de distancias
 */
function initCustomSelects() {
  ["pointA", "pointB"].forEach((selectId) => {
    const container = document.getElementById(selectId + "-container");
    const selected = document.getElementById(selectId + "-selected");
    const items = document.getElementById(selectId + "-items");

    // Manejar clic en el selector principal
    selected.addEventListener("click", function (e) {
      e.stopPropagation();

      // Cerrar otros dropdowns primero
      document.querySelectorAll(".select-items").forEach((otherItems) => {
        if (otherItems !== items) {
          otherItems.classList.remove("show");
        }
      });
      document.querySelectorAll(".select-selected").forEach((otherSelected) => {
        if (otherSelected !== selected) {
          otherSelected.classList.remove("select-arrow-active");
        }
      });

      // Alternar el estado del dropdown actual
      const isCurrentlyOpen = items.classList.contains("show");
      if (isCurrentlyOpen) {
        items.classList.remove("show");
        selected.classList.remove("select-arrow-active");
        adjustZIndex(null); // Resetear z-index
      } else {
        items.classList.add("show");
        selected.classList.add("select-arrow-active");
        adjustZIndex(selectId); // Aumentar z-index para el selector activo
      }
    });

    // Manejar clics en las opciones del dropdown
    items.addEventListener("click", function (e) {
      e.stopPropagation();
      if (e.target.hasAttribute("data-value")) {
        // Actualizar el texto mostrado
        selected.textContent = e.target.textContent;
        container.setAttribute(
          "data-value",
          e.target.getAttribute("data-value")
        );

        // Remover clase 'selected' de todas las opciones
        items
          .querySelectorAll(".selected")
          .forEach((item) => item.classList.remove("selected"));

        // Agregar clase 'selected' a la opción clickeada
        e.target.classList.add("selected");

        // Cerrar el dropdown
        items.classList.remove("show");
        selected.classList.remove("select-arrow-active");
        adjustZIndex(null); // Resetear z-index
      }
    });
  });
}

/**
 * Cierra todos los selectores personalizados abiertos
 */
function closeAllSelect() {
  document.querySelectorAll(".select-items").forEach((items) => {
    items.classList.remove("show");
  });
  document.querySelectorAll(".select-selected").forEach((selected) => {
    selected.classList.remove("select-arrow-active");
  });
}

/**
 * Ajusta los z-index para evitar problemas de superposición en los dropdowns
 * @param {string|null} activeSelectId - ID del selector activo o null para resetear
 */
function adjustZIndex(activeSelectId) {
  // Resetear todos los z-indexes a valores base
  document.querySelectorAll(".distance-field").forEach((field) => {
    field.style.zIndex = "100";
  });
  document
    .querySelectorAll(".distance-field .custom-select")
    .forEach((select) => {
      select.style.zIndex = "101";
    });
  document
    .querySelectorAll(".distance-field .select-items")
    .forEach((items) => {
      items.style.zIndex = "1000";
    });

  // Aumentar el z-index del selector activo
  if (activeSelectId) {
    const activeField = document
      .getElementById(activeSelectId + "-container")
      .closest(".distance-field");
    const activeSelect = document.getElementById(activeSelectId + "-container");
    const activeItems = document.getElementById(activeSelectId + "-items");

    if (activeField) activeField.style.zIndex = "2000";
    if (activeSelect) activeSelect.style.zIndex = "2001";
    if (activeItems) activeItems.style.zIndex = "12000";
  }
}

// ========== INICIALIZACIÓN Y EVENT LISTENERS ==========

/**
 * Event listener para detectar Enter en el input de números
 */
document
  .getElementById("numberInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addNumber();
    }
  });

/**
 * Event listener para cerrar dropdowns al hacer clic fuera de ellos
 */
document.addEventListener("click", function (e) {
  if (!e.target.closest(".custom-select")) {
    closeAllSelect();
    adjustZIndex(null); // Resetear z-index
  }
});

// ========== INICIALIZACIÓN DE LA APLICACIÓN ==========

// Inicializar los selectores personalizados
initCustomSelects();

// Mostrar la visualización inicial
updateDisplay();
