function cleanString(str) {
  return str.replace(/\s+/g, "");
}

function resolverEcuacionParseada() {
  const ecuacionStr = document.getElementById("ecuacion").value;
  const resBox = document.getElementById("resDespejeParseado");
  const errorBox = document.getElementById("mensajeError");

  resBox.innerHTML = "";
  errorBox.innerText = "";

  try {
    const partes = ecuacionStr.split("=");
    if (partes.length !== 2) {
      throw new Error("La ecuación debe contener exactamente un signo '='");
    }

    const ladoIzq = partes[0].trim();
    const ladoDer = partes[1].trim();

    const ecuacionFormateada = `(${ladoIzq}) - (${ladoDer})`;

    const nodo = math.parse(ecuacionFormateada);
    const simplificado = math.simplify(nodo);

    const coeficientes = extraerCoeficientes(simplificado.toString());
    const solucion = -coeficientes.b / coeficientes.a;

    resBox.innerHTML = `
            <div class="formula-original">
                <strong>Conjuro Original:</strong> ${ecuacionStr}
            </div>
            <p><strong>Resultado Místico:</strong> x = ${solucion}</p>
            <p><strong>Ecuación Simplificada:</strong> ${simplificado.toString()} = 0</p>
        `;
  } catch (error) {
    errorBox.innerText = `¡Error de la Noche de Brujas! ${error.message}`;
  }
}

function extraerCoeficientes(ecuacion) {
  ecuacion = ecuacion.replace(/\s+/g, "");

  let a = 0;
  let b = 0;

  const regexX = /([+-]?\d*\.?\d*)\*?x/g;
  let match;
  while ((match = regexX.exec(ecuacion)) !== null) {
    let coef = match[1];
    if (coef === "" || coef === "+") coef = "1";
    if (coef === "-") coef = "-1";
    a += parseFloat(coef);
  }

  const sinX = ecuacion.replace(/[+-]?\d*\.?\d*\*?x/g, "");
  if (sinX) {
    try {
      b = math.evaluate(sinX);
    } catch (e) {
      b = 0;
    }
  }

  return { a, b };
}

function extractVariables(formulaStr) {
  const matches = formulaStr.match(/[a-zA-Z][a-zA-Z0-9]*/g);
  if (!matches) return [];
  return Array.from(new Set(matches));
}

function despejarVariable(
  expresionOriginal,
  variableObjetivo,
  variableDespejada
) {
  try {
    let expresion = expresionOriginal.replace(/\s+/g, "");

    const patronComplejo =
      /(\d*\.?\d*)\(([a-zA-Z]+)\s*([+-])\s*(\d+\.?\d*)\)\s*\/\s*(\d+\.?\d*)/;
    const matchComplejo = expresion.match(patronComplejo);

    if (matchComplejo && matchComplejo[2] === variableObjetivo) {
      const coef1 = matchComplejo[1] || "1";
      const operador = matchComplejo[3];
      const constante = matchComplejo[4];
      const divisor = matchComplejo[5];

      const operadorInverso = operador === "-" ? "+" : "-";

      if (coef1 === "1") {
        return `(${variableDespejada}) * (${divisor}) ${operadorInverso} ${constante}`;
      } else {
        return `((${variableDespejada}) * (${divisor}) / (${coef1})) ${operadorInverso} ${constante}`;
      }
    }

    if (expresion.includes("+") || expresion.includes("-")) {
      const resultado = despejarSumaResta(
        expresion,
        variableObjetivo,
        variableDespejada
      );
      if (resultado !== null) {
        return resultado;
      }
    }

    if (expresion.includes("/")) {
      const partes = dividirPorOperadorPrincipal(expresion, "/");
      const numerador = partes[0];
      const denominador = partes[1];

      if (numerador.includes(variableObjetivo)) {
        if (numerador === variableObjetivo) {
          return `(${variableDespejada}) * (${denominador})`;
        } else {
          const factoresNum = extraerFactoresMultiplicacion(numerador);
          const otrosFactores = factoresNum.filter(
            (f) => f !== variableObjetivo
          );

          if (otrosFactores.length === 0) {
            return `(${variableDespejada}) * (${denominador})`;
          } else {
            return `((${variableDespejada}) * (${denominador})) / (${otrosFactores.join(
              " * "
            )})`;
          }
        }
      } else if (denominador.includes(variableObjetivo)) {
        if (denominador === variableObjetivo) {
          return `(${numerador}) / (${variableDespejada})`;
        } else {
          const factoresDen = extraerFactoresMultiplicacion(denominador);
          const otrosFactores = factoresDen.filter(
            (f) => f !== variableObjetivo
          );

          if (otrosFactores.length === 0) {
            return `(${numerador}) / (${variableDespejada})`;
          } else {
            return `(${numerador}) / ((${variableDespejada}) * (${otrosFactores.join(
              " * "
            )}))`;
          }
        }
      }
    }

    if (expresion.includes("*")) {
      const factores = extraerFactoresMultiplicacion(expresion);
      const otrosFactores = factores.filter((f) => f !== variableObjetivo);

      if (otrosFactores.length === 0) {
        return variableDespejada;
      } else if (otrosFactores.length === 1) {
        return `(${variableDespejada}) / (${otrosFactores[0]})`;
      } else {
        return `(${variableDespejada}) / (${otrosFactores.join(" * ")})`;
      }
    }

    if (expresion === variableObjetivo) {
      return variableDespejada;
    }

    return expresion;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

function despejarSumaResta(expresion, variableObjetivo, variableDespejada) {
  const terminos = parsearTerminos(expresion);

  let terminoConVariable = null;
  let otrosTerminos = [];

  for (const termino of terminos) {
    if (termino.texto.includes(variableObjetivo)) {
      terminoConVariable = termino;
    } else {
      otrosTerminos.push(termino);
    }
  }

  if (!terminoConVariable) {
    return null;
  }

  let resultado = variableDespejada;

  for (const termino of otrosTerminos) {
    const signoInverso = termino.signo === "+" ? "-" : "+";
    resultado += ` ${signoInverso} (${termino.texto})`;
  }

  let signoFinal = "";
  let divisor = "";
  let terminoLimpio = terminoConVariable.texto;

  if (terminoLimpio.startsWith("-")) {
    signoFinal = "-";
    terminoLimpio = terminoLimpio.substring(1);
  }

  if (terminoLimpio !== variableObjetivo) {
    if (terminoLimpio.includes("*")) {
      const partes = terminoLimpio.split("*");
      divisor = partes.find((p) => p !== variableObjetivo);
    } else if (terminoLimpio.match(/^\d+$/)) {
      divisor = terminoLimpio;
    }
  }

  let finalResult = resultado;

  if (divisor) {
    finalResult = `(${resultado}) / (${divisor})`;
  }

  if (signoFinal === "-") {
    finalResult = `-(${finalResult})`;
  }

  return finalResult;
}

function parsearTerminos(expresion) {
  const terminos = [];
  let actual = "";
  let signo = "+";
  let nivel = 0;

  for (let i = 0; i < expresion.length; i++) {
    const char = expresion[i];

    if (char === "(") {
      nivel++;
      actual += char;
    } else if (char === ")") {
      nivel--;
      actual += char;
    } else if ((char === "+" || char === "-") && nivel === 0 && actual !== "") {
      terminos.push({ signo: signo, texto: actual });
      signo = char;
      actual = "";
    } else if ((char === "+" || char === "-") && nivel === 0 && actual === "") {
      signo = char;
    } else {
      actual += char;
    }
  }

  if (actual) {
    terminos.push({ signo: signo, texto: actual });
  }

  return terminos;
}

function dividirPorOperadorPrincipal(expresion, operador) {
  let nivel = 0;
  let ultimaPosicion = -1;

  for (let i = expresion.length - 1; i >= 0; i--) {
    const char = expresion[i];

    if (char === ")") {
      nivel++;
    } else if (char === "(") {
      nivel--;
    } else if (char === operador && nivel === 0) {
      ultimaPosicion = i;
      break;
    }
  }

  if (ultimaPosicion === -1) {
    return [expresion];
  }

  const parte1 = expresion.substring(0, ultimaPosicion);
  const parte2 = expresion.substring(ultimaPosicion + 1);

  return [parte1, parte2];
}

function extraerFactoresMultiplicacion(expresion) {
  const factores = [];
  let actual = "";
  let nivel = 0;

  for (let i = 0; i < expresion.length; i++) {
    const char = expresion[i];

    if (char === "(") {
      nivel++;
      actual += char;
    } else if (char === ")") {
      nivel--;
      actual += char;
    } else if (char === "*" && nivel === 0) {
      if (actual) {
        factores.push(actual);
        actual = "";
      }
    } else {
      actual += char;
    }
  }

  if (actual) {
    factores.push(actual);
  }

  return factores;
}

function procesarFormulaLiteral() {
  const formulaStr = document.getElementById("formulaLiteral").value;
  const resBox = document.getElementById("resFormulaLiteral");
  const errorBox = document.getElementById("mensajeErrorFormula");

  resBox.innerHTML = "";
  errorBox.innerText = "";

  try {
    const partes = formulaStr.split("=");
    if (partes.length !== 2) {
      throw new Error("La fórmula debe contener exactamente un signo '='");
    }

    const ladoIzq = partes[0].trim();
    const ladoDer = partes[1].trim();

    const variables = extractVariables(formulaStr);

    if (variables.length < 2) {
      throw new Error(
        "Se necesitan al menos 2 variables distintas en la fórmula"
      );
    }

    let htmlTable = `
            <div class="formula-original">
                <strong>Fórmula Original del Pergamino:</strong> ${formulaStr}
            </div>
            <p><strong>Variables Mágicas detectadas:</strong> ${variables.join(
              ", "
            )}</p>
            <table>
                <thead>
                    <tr>
                        <th>Runa a Despejar</th>
                        <th>Fórmula de Transformación</th>
                    </tr>
                </thead>
                <tbody>
        `;

    for (const variable of variables) {
      let formulaDespejada;

      if (ladoIzq === variable) {
        formulaDespejada = `${variable} = ${ladoDer}`;
      } else if (ladoDer === variable) {
        formulaDespejada = `${variable} = ${ladoIzq}`;
      } else {
        const resultado = despejarVariable(ladoDer, variable, ladoIzq);
        formulaDespejada = `${variable} = ${resultado}`;
      }

      // Simplificación adicional manual para evitar doble paréntesis innecesario
      if (
        formulaDespejada.startsWith(`${variable} = (`) &&
        formulaDespejada.endsWith(`)`)
      ) {
        formulaDespejada = `${variable} = ${formulaDespejada.substring(
          formulaDespejada.indexOf("(") + 1,
          formulaDespejada.lastIndexOf(")")
        )}`;
      }

      htmlTable += `
                <tr>
                    <td><strong>${variable}</strong></td>
                    <td><pre>${formulaDespejada}</pre></td>
                </tr>
            `;
    }

    htmlTable += `
                </tbody>
            </table>
            <div class="nota-didactica">
                <strong>Nota del Alquimista:</strong> Las runas son generadas usando manipulación algebraica.
                Verifica los paréntesis en fórmulas complejas.
            </div>
        `;

    resBox.innerHTML = htmlTable;
  } catch (error) {
    errorBox.innerText = `¡Error en el Despeje de Fórmulas! ${error.message}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  resolverEcuacionParseada();
});
