// Variables globales
let patternsData = null;
let conversionHistory = [];
let stats = {
  totalConversions: 0,
  satisfactoryConversions: 0,
  totalPatterns: 0,
  fileSize: 0,
  lastUpdate: null,
};

// Patrones por defecto para comenzar
const defaultPatterns = {
  patterns: [
    {
      id: 1,
      natural: "La suma de {var1} y {var2}",
      algebraic: "{var1} + {var2}",
      category: "operaciones_basicas",
    },
    {
      id: 2,
      natural: "La resta de {var1} y {var2}",
      algebraic: "{var1} - {var2}",
      category: "operaciones_basicas",
    },
    {
      id: 3,
      natural: "El producto de {var1} por {var2}",
      algebraic: "{var1} × {var2}",
      category: "operaciones_basicas",
    },
    {
      id: 4,
      natural: "El cociente de {var1} sobre {var2}",
      algebraic: "{var1} ÷ {var2}",
      category: "operaciones_basicas",
    },
    {
      id: 5,
      natural: "La suma de los cuadrados de {var1} y {var2}",
      algebraic: "{var1}^2 + {var2}^2",
      category: "combinadas",
    },
    {
      id: 6,
      natural: "El cuadrado de {var1}",
      algebraic: "{var1}^2",
      category: "potencias",
    },
    {
      id: 7,
      natural: "El cubo de {var1}",
      algebraic: "{var1}^3",
      category: "potencias",
    },
    {
      id: 8,
      natural: "La raíz cuadrada de {var1}",
      algebraic: "√{var1}",
      category: "radicales",
    },
  ],
};

// Inicialización cuando se carga la página
document.addEventListener("DOMContentLoaded", function () {
  // Cargar patrones por defecto
  loadPatterns(defaultPatterns);

  // Configurar event listeners
  setupEventListeners();

  // Actualizar métricas iniciales
  updateMetrics();
});

// Configurar todos los event listeners
function setupEventListeners() {
  // Botones de conversión
  document
    .getElementById("convert-to-algebraic-btn")
    .addEventListener("click", () => {
      convertNaturalToAlgebraic();
    });

  document
    .getElementById("convert-to-natural-btn")
    .addEventListener("click", () => {
      convertAlgebraicToNatural();
    });

  // Botones de evaluación - Columna Natural
  document
    .getElementById("natural-satisfactory-btn")
    .addEventListener("click", () => {
      markAsSatisfactory("natural");
    });

  document
    .getElementById("natural-improve-btn")
    .addEventListener("click", () => {
      markForImprovement("natural");
    });

  document
    .getElementById("natural-add-pattern-btn")
    .addEventListener("click", () => {
      showAddPatternDialog("natural");
    });

  // Botones de evaluación - Columna Algebraica
  document
    .getElementById("algebraic-satisfactory-btn")
    .addEventListener("click", () => {
      markAsSatisfactory("algebraic");
    });

  document
    .getElementById("algebraic-improve-btn")
    .addEventListener("click", () => {
      markForImprovement("algebraic");
    });

  document
    .getElementById("algebraic-add-pattern-btn")
    .addEventListener("click", () => {
      showAddPatternDialog("algebraic");
    });

  // Manejo de archivos JSON
  document
    .getElementById("json-file-input")
    .addEventListener("change", handleFileSelection);
  document
    .getElementById("load-json-btn")
    .addEventListener("click", loadJSONFile);
  document
    .getElementById("reset-json-btn")
    .addEventListener("click", resetToDefault);

  // Historial
  document
    .getElementById("clear-history-btn")
    .addEventListener("click", clearHistory);
  document
    .getElementById("export-history-btn")
    .addEventListener("click", exportHistory);
}

// Función para convertir lenguaje natural a algebraico
function convertNaturalToAlgebraic() {
  const input = document.getElementById("natural-input").value.trim();
  if (!input) {
    alert("Por favor, ingresa una expresión en lenguaje natural");
    return;
  }

  const result = processNaturalToAlgebraic(input);
  displayResult("natural", input, result);

  // Actualizar estadísticas
  stats.totalConversions++;
  addToHistory("natural-to-algebraic", input, result);
  updateMetrics();
}

// Función para convertir algebraico a lenguaje natural
function convertAlgebraicToNatural() {
  const input = document.getElementById("algebraic-input").value.trim();
  if (!input) {
    alert("Por favor, ingresa una expresión algebraica");
    return;
  }

  const result = processAlgebraicToNatural(input);
  displayResult("algebraic", input, result);

  // Actualizar estadísticas
  stats.totalConversions++;
  addToHistory("algebraic-to-natural", input, result);
  updateMetrics();
}

// Procesar conversión de natural a algebraico
function processNaturalToAlgebraic(input) {
  if (!patternsData || !patternsData.patterns) {
    return "Error: No hay patrones cargados";
  }

  const normalizedInput = input.toLowerCase();

  // Buscar patrones que coincidan
  for (let pattern of patternsData.patterns) {
    const match = matchNaturalPattern(normalizedInput, pattern.natural);
    if (match.isMatch) {
      return substituteVariables(pattern.algebraic, match.variables);
    }
  }

  return "No se encontró un patrón coincidente. Considera agregar este caso a los patrones.";
}

// Procesar conversión de algebraico a natural
function processAlgebraicToNatural(input) {
  if (!patternsData || !patternsData.patterns) {
    return "Error: No hay patrones cargados";
  }

  const normalizedInput = normalizeAlgebraicExpression(input);

  // Buscar patrones que coincidan
  for (let pattern of patternsData.patterns) {
    const match = matchAlgebraicPattern(normalizedInput, pattern.algebraic);
    if (match.isMatch) {
      return substituteVariables(pattern.natural, match.variables);
    }
  }

  return "No se encontró un patrón coincidente. Considera agregar este caso a los patrones.";
}

// Función para hacer coincidir patrones de lenguaje natural
function matchNaturalPattern(input, pattern) {
  // Convertir patrón a regex
  let regex = pattern.toLowerCase();
  const variables = {};
  let varCounter = 0;

  // Reemplazar variables con grupos de captura
  regex = regex.replace(/\{(\w+)\}/g, (match, varName) => {
    variables[varName] = varCounter++;
    return "([a-zA-Z0-9_]+)";
  });

  // Hacer que los espacios sean opcionales y flexibles
  regex = regex.replace(/\s+/g, "\\s*");
  regex = "^\\s*" + regex + "\\s*$";

  const regexPattern = new RegExp(regex);
  const match = input.match(regexPattern);

  if (match) {
    const extractedVars = {};
    for (let [varName, index] of Object.entries(variables)) {
      extractedVars[varName] = match[index + 1];
    }
    return { isMatch: true, variables: extractedVars };
  }

  return { isMatch: false, variables: {} };
}

// Función para hacer coincidir patrones algebraicos
function matchAlgebraicPattern(input, pattern) {
  let normalizedInput = normalizeAlgebraicExpression(input);
  let normalizedPattern = normalizeAlgebraicExpression(pattern);

  // Escapar caracteres especiales
  let regex = normalizedPattern.replace(/[+\-*^]/g, "\\$&");

  const variables = {};
  let varCounter = 0;

  // Reemplazar variables con grupos de captura
  regex = regex.replace(/\{(\w+)\}/g, (match, varName) => {
    variables[varName] = varCounter++;
    return "([a-zA-Z0-9_]+)";
  });

  regex = "^\\s*" + regex + "\\s*$";

  const regexPattern = new RegExp(regex);
  const match = normalizedInput.match(regexPattern);

  if (match) {
    const extractedVars = {};
    for (let [varName, index] of Object.entries(variables)) {
      extractedVars[varName] = match[index + 1];
    }
    return { isMatch: true, variables: extractedVars };
  }

  return { isMatch: false, variables: {} };
}

// Normalizar expresiones algebraicas
function normalizeAlgebraicExpression(expr) {
  return expr
    .replace(/\s+/g, "") // Quitar espacios
    .replace(/²/g, "^2") // Convertir ² a ^2
    .replace(/³/g, "^3") // Convertir ³ a ^3
    .replace(/\*/g, "×") // Normalizar multiplicación
    .replace(/\//g, "÷") // Normalizar división
    .toLowerCase();
}

// Sustituir variables en el patrón
function substituteVariables(template, variables) {
  let result = template;
  for (let [varName, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${varName}\\}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}

// Mostrar resultado en la interfaz
function displayResult(column, input, result) {
  const resultSection = document.getElementById(`${column}-result`);
  const outputElement = document.getElementById(`${column}-output`);

  outputElement.textContent = result;
  resultSection.style.display = "block";
}

// Marcar como satisfactorio
function markAsSatisfactory(column) {
  stats.satisfactoryConversions++;
  updateMetrics();

  // Feedback visual
  showFeedback(`Marcado como satisfactorio`, "success");

  // Ocultar la sección de resultado después de un tiempo
  setTimeout(() => {
    document.getElementById(`${column}-result`).style.display = "none";
  }, 2000);
}

// Marcar para mejora
function markForImprovement(column) {
  showFeedback(
    "Marcado para mejora. Considera agregar un nuevo patrón.",
    "warning"
  );
}

// Mostrar diálogo para agregar patrón
function showAddPatternDialog(column) {
  const input = document.getElementById(
    `${column === "natural" ? "natural" : "algebraic"}-input`
  ).value;
  const output = document.getElementById(`${column}-output`).textContent;

  const naturalText = column === "natural" ? input : output;
  const algebraicText = column === "natural" ? output : input;

  const newNatural = prompt("Expresión en lenguaje natural:", naturalText);
  if (!newNatural) return;

  const newAlgebraic = prompt("Expresión algebraica:", algebraicText);
  if (!newAlgebraic) return;

  const category =
    prompt("Categoría (opcional):", "personalizado") || "personalizado";

  addNewPattern(newNatural, newAlgebraic, category);
}

// Agregar nuevo patrón
function addNewPattern(natural, algebraic, category) {
  if (!patternsData || !patternsData.patterns) {
    patternsData = { patterns: [] };
  }

  const newId =
    patternsData.patterns.length > 0
      ? Math.max(...patternsData.patterns.map((p) => p.id)) + 1
      : 1;

  patternsData.patterns.push({
    id: newId,
    natural: natural,
    algebraic: algebraic,
    category: category,
  });

  stats.totalPatterns = patternsData.patterns.length;
  stats.lastUpdate = new Date().toLocaleString();

  updateMetrics();
  showFeedback("Nuevo patrón agregado correctamente", "success");
}

// Cargar patrones
function loadPatterns(data) {
  patternsData = data;
  stats.totalPatterns = data.patterns.length;
  stats.lastUpdate = new Date().toLocaleString();

  updateMetrics();
  showFeedback("Patrones cargados correctamente", "success");
}

// Manejar selección de archivo
function handleFileSelection(event) {
  const file = event.target.files[0];
  const fileNameElement = document.getElementById("file-name");
  const loadButton = document.getElementById("load-json-btn");

  if (file) {
    fileNameElement.textContent = file.name;
    stats.fileSize = (file.size / 1024).toFixed(2);
    loadButton.disabled = false;
    updateMetrics();
  } else {
    fileNameElement.textContent = "Ningún archivo seleccionado";
    loadButton.disabled = true;
  }
}

// Cargar archivo JSON
function loadJSONFile() {
  const fileInput = document.getElementById("json-file-input");
  const file = fileInput.files[0];

  if (!file) {
    showFeedback("Por favor, selecciona un archivo JSON", "error");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      loadPatterns(jsonData);
    } catch (error) {
      showFeedback(
        "Error al parsear el archivo JSON: " + error.message,
        "error"
      );
    }
  };

  reader.onerror = function () {
    showFeedback("Error al leer el archivo", "error");
  };

  reader.readAsText(file);
}

// Resetear a patrones por defecto
function resetToDefault() {
  loadPatterns(defaultPatterns);
  document.getElementById("json-file-input").value = "";
  document.getElementById("file-name").textContent =
    "Ningún archivo seleccionado";
  document.getElementById("load-json-btn").disabled = true;
}

// Agregar al historial
function addToHistory(type, input, output) {
  const timestamp = new Date().toLocaleString();
  conversionHistory.push({
    type: type,
    input: input,
    output: output,
    timestamp: timestamp,
  });

  updateHistoryDisplay();
}

// Actualizar visualización del historial
function updateHistoryDisplay() {
  const historyElement = document.getElementById("conversion-history");

  if (conversionHistory.length === 0) {
    historyElement.innerHTML =
      '<p class="no-history">No hay conversiones realizadas aún</p>';
    return;
  }

  let html = "";
  for (let i = conversionHistory.length - 1; i >= 0; i--) {
    const item = conversionHistory[i];
    html += `
            <div class="history-item" style="border-bottom: 1px solid #ddd; padding: 10px 0;">
                <div style="font-weight: bold;">${
                  item.type === "natural-to-algebraic"
                    ? "Natural → Algebraico"
                    : "Algebraico → Natural"
                }</div>
                <div><strong>Entrada:</strong> ${item.input}</div>
                <div><strong>Salida:</strong> ${item.output}</div>
                <div style="font-size: 0.8em; color: #666;">${
                  item.timestamp
                }</div>
            </div>
        `;
  }

  historyElement.innerHTML = html;
}

// Limpiar historial
function clearHistory() {
  if (conversionHistory.length === 0) {
    showFeedback("El historial ya está vacío", "warning");
    return;
  }

  if (confirm("¿Estás seguro de que quieres limpiar el historial?")) {
    conversionHistory = [];
    updateHistoryDisplay();
    showFeedback("Historial limpiado correctamente", "success");
  }
}

// Exportar historial
function exportHistory() {
  if (conversionHistory.length === 0) {
    showFeedback("No hay historial para exportar", "warning");
    return;
  }

  const dataStr = JSON.stringify(conversionHistory, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "historial_conversiones.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showFeedback("Historial exportado correctamente", "success");
}

// Mostrar mensaje de feedback
function showFeedback(message, type) {
  const feedbackElement = document.getElementById("feedback");
  feedbackElement.textContent = message;
  feedbackElement.className = `feedback ${type} show`;

  setTimeout(() => {
    feedbackElement.classList.remove("show");
  }, 3000);
}

// Actualizar métricas en la interfaz
function updateMetrics() {
  document.getElementById("total-patterns").textContent = stats.totalPatterns;
  document.getElementById("file-size").textContent = stats.fileSize + " KB";
  document.getElementById("conversions-count").textContent =
    stats.totalConversions;

  const satisfactionRate =
    stats.totalConversions > 0
      ? Math.round(
          (stats.satisfactoryConversions / stats.totalConversions) * 100
        )
      : 0;
  document.getElementById("satisfaction-rate").textContent =
    satisfactionRate + "%";

  document.getElementById("last-update").textContent = stats.lastUpdate || "--";

  // Calcular complejidad promedio (palabras por expresión natural)
  if (patternsData && patternsData.patterns.length > 0) {
    const totalWords = patternsData.patterns.reduce((sum, pattern) => {
      return sum + pattern.natural.split(" ").length;
    }, 0);
    const avgComplexity = (totalWords / patternsData.patterns.length).toFixed(
      1
    );
    document.getElementById("avg-complexity").textContent = avgComplexity;
  } else {
    document.getElementById("avg-complexity").textContent = "0";
  }
}
