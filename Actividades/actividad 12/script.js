class NumeroComplejo {
  constructor(real, imag = 0) {
    this.real = real;
    this.imag = imag;
  }

  sumar(otro) {
    return new NumeroComplejo(this.real + otro.real, this.imag + otro.imag);
  }

  multiplicar(otro) {
    return new NumeroComplejo(
      this.real * otro.real - this.imag * otro.imag,
      this.real * otro.imag + this.imag * otro.real
    );
  }

  toString() {
    if (this.imag === 0) {
      return this.real.toFixed(4).replace(/\.?0+$/, "");
    }

    const realStr = this.real.toFixed(4).replace(/\.?0+$/, "");
    const imagStr = Math.abs(this.imag)
      .toFixed(4)
      .replace(/\.?0+$/, "");

    if (this.real === 0) {
      return `${imagStr}i`;
    }

    const signo = this.imag >= 0 ? "+" : "-";
    return `${realStr}${signo}${imagStr}i`;
  }

  esReal() {
    return Math.abs(this.imag) < 1e-10;
  }
}

function parsearPolinomio(str) {
  str = str.trim().replace(/\s/g, "");

  const gradoMatch = str.match(/x\^(\d+)/g);
  let gradoMax = 1;

  if (gradoMatch) {
    gradoMax = Math.max(...gradoMatch.map((m) => parseInt(m.match(/\d+/)[0])));
  } else if (str.includes("x")) {
    gradoMax = 1;
  } else {
    gradoMax = 0;
  }

  const coeficientes = new Array(gradoMax + 1)
    .fill(null)
    .map(() => new NumeroComplejo(0));

  str = str.replace(/([+-])\s*x/g, "$1 1x");
  str = str.replace(/^x/, "1x");

  const terminos = str.match(/[+-]?[^+-]+/g) || [];

  for (let termino of terminos) {
    termino = termino.trim();

    if (!termino) continue;

    let coef, grado;

    if (!termino.includes("x")) {
      coef = parsearComplejo(termino);
      grado = 0;
    } else if (termino.includes("x^")) {
      const partes = termino.split("x^");
      coef =
        partes[0] === "" || partes[0] === "+"
          ? new NumeroComplejo(1)
          : partes[0] === "-"
          ? new NumeroComplejo(-1)
          : parsearComplejo(partes[0]);
      grado = parseInt(partes[1]);
    } else {
      const partes = termino.split("x");
      coef =
        partes[0] === "" || partes[0] === "+"
          ? new NumeroComplejo(1)
          : partes[0] === "-"
          ? new NumeroComplejo(-1)
          : parsearComplejo(partes[0]);
      grado = 1;
    }

    const indice = gradoMax - grado;
    coeficientes[indice] = coeficientes[indice].sumar(coef);
  }

  return coeficientes;
}

function parsearComplejo(str) {
  str = str.trim().replace(/\s/g, "");

  if (!str.includes("i")) {
    return new NumeroComplejo(parseFloat(str));
  }

  str = str.replace(/i/g, "");

  let real = 0;
  let imag = 0;

  const complexRegex = /^([+-]?\d*\.?\d+)?([+-]\d*\.?\d+)?$/;
  const match = str.match(complexRegex);

  if (
    (str.includes("+") && str.indexOf("+") > 0) ||
    (str.includes("-") && str.indexOf("-") > 0 && str.indexOf("-") !== 0)
  ) {
    const partes = str.split(/(?=[+-])/);
    real = parseFloat(partes[0]) || 0;
    imag =
      parseFloat(partes[1]) || partes[1] === "+" || partes[1] === "-"
        ? parseFloat(partes[1] + "1")
        : 1;
  } else if (
    str.includes("+") ||
    (str.includes("-") && str.indexOf("-") === 0)
  ) {
    imag = parseFloat(str) || (str === "+" ? 1 : str === "-" ? -1 : 1);
    real = 0;
  } else {
    real = parseFloat(str);
  }

  if (str === "+" || str === "") imag = 1;
  if (str === "-") imag = -1;

  return new NumeroComplejo(real, imag);
}

function calcularDivision() {
  try {
    const polinomioStr = document.getElementById("polinomio").value;
    const raizStr = document.getElementById("raiz").value;

    if (!polinomioStr || !raizStr) {
      throw new Error("Por favor ingresa todos los datos");
    }

    const coeficientes = parsearPolinomio(polinomioStr);
    const raiz = parsearComplejo(raizStr);

    const resultado = divisionSintetica(coeficientes, raiz);
    mostrarResultado(resultado, coeficientes, raiz, polinomioStr);
  } catch (error) {
    document.getElementById("resultado").innerHTML = `
            <div class="error">
                <strong>[ERROR 404]:</strong> ${error.message}
            </div>
        `;
    document.getElementById("resultado").classList.add("show");
  }
}

function divisionSintetica(coeficientes, raiz) {
  const n = coeficientes.length;
  const proceso = [];
  const resultado = [];

  proceso.push([...coeficientes]);
  proceso.push([new NumeroComplejo(0)]);

  resultado.push(coeficientes[0]);

  for (let i = 1; i < n; i++) {
    const producto = resultado[i - 1].multiplicar(raiz);
    proceso[1].push(producto);
    resultado.push(coeficientes[i].sumar(producto));
  }

  const cociente = resultado.slice(0, -1);
  const residuo = resultado[resultado.length - 1];

  return {
    proceso: proceso,
    resultado: resultado,
    cociente: cociente,
    residuo: residuo,
  };
}

function mostrarResultado(resultado, coeficientes, raiz, polinomioOriginal) {
  let html = '<div class="result-title">Polinomio Original</div>';
  html +=
    '<div style="text-align: center; font-size: 1.2em; margin-bottom: 20px; padding: 15px; background: var(--bg-color); border: 1px solid var(--accent-neon-blue); border-radius: 4px; color: var(--accent-neon-blue); box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);"> ';
  html += "<strong>" + polinomioOriginal + "</strong>";
  html += "</div>";

  html += '<div class="result-title">Coeficientes Extraídos</div>';
  html += '<table class="process-table" style="margin-bottom: 30px;">';
  html += "<tr>";
  for (let i = 0; i < coeficientes.length; i++) {
    const exp = coeficientes.length - 1 - i;
    html += "<td><strong>";
    if (exp === 0) {
      html += "Término Independiente";
    } else if (exp === 1) {
      html += "X^1";
    } else {
      html += "X^" + exp;
    }
    html += "</strong></td>";
  }
  html += "</tr>";
  html += "<tr>";
  coeficientes.forEach((c) => {
    html += "<td>" + c.toString() + "</td>";
  });
  html += "</tr>";
  html += "</table>";

  html += '<div class="result-title">Proceso de División Sintética</div>';

  html += '<table class="process-table">';

  html += '<tr><td class="divisor-cell">Divisor: ' + raiz.toString() + "</td>";
  coeficientes.forEach((c) => {
    html += "<td>" + c.toString() + "</td>";
  });
  html += "</tr>";

  html += '<tr><td class="divisor-cell">Multiplicar y Bajar</td>';
  resultado.proceso[1].forEach((p) => {
    html += "<td>" + p.toString() + "</td>";
  });
  html += "</tr>";

  html += '<tr><td class="divisor-cell">Resultado (Sumar)</td>';
  resultado.resultado.forEach((r) => {
    html += "<td>" + r.toString() + "</td>";
  });
  html += "</tr>";

  html += "</table>";

  html += '<div class="final-result">';
  html += "<p><strong>Cociente (Q(x)):</strong> ";

  let cocienteStr = "";
  for (let i = 0; i < resultado.cociente.length; i++) {
    const exp = resultado.cociente.length - 1 - i;
    const coef = resultado.cociente[i];

    if (coef.esReal() && Math.abs(coef.real) < 1e-10) continue;

    const isPositive = coef.real > 0 || (coef.real === 0 && coef.imag > 0);

    if (cocienteStr && isPositive) {
      cocienteStr += " + ";
    }

    let coefStr = coef.toString();

    if (exp > 0) {
      if (coefStr === "1" && exp > 0) {
        coefStr = "";
      } else if (coefStr === "-1" && exp > 0) {
        coefStr = "-";
      } else {
        coefStr = "(" + coefStr + ")";
      }
    }

    cocienteStr += coefStr;

    if (exp > 0) {
      cocienteStr += "x";
      if (exp > 1) {
        cocienteStr += "<sup>" + exp + "</sup>";
      }
    }
  }

  html += cocienteStr.trim() || "0";
  html += "</p>";

  html +=
    "<p><strong>Residuo (R):</strong> " + resultado.residuo.toString() + "</p>";

  if (resultado.residuo.esReal() && Math.abs(resultado.residuo.real) < 1e-10) {
    html += '<p class="exact">✓ La división es exacta (Residuo = 0)</p>';
  }

  html += "</div>";

  document.getElementById("resultado").innerHTML = html;
  document.getElementById("resultado").classList.add("show");
}
