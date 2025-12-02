// Mensaje de bienvenida en consola
console.log(
  "Bienvenido Josue, el JavaScript global está funcionando correctamente."
);

// Seleccionar todos los botones
const botones = document.querySelectorAll(".botones button");

// Efecto visual: botón "parpadea" suavemente al pasar el mouse
botones.forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.05)";
    btn.style.transition = "0.2s";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "scale(1)";
  });
});

// Comprobación de enlaces — avisa si algún enlace no funciona
const enlaces = document.querySelectorAll(".botones a");

enlaces.forEach((link) => {
  const url = link.getAttribute("href");

  // Verifica si la ruta parece incorrecta (espacios, mayúsculas raras)
  if (url.includes(" ")) {
    console.warn(
      `⚠ El enlace "${url}" tiene un espacio. Considera corregirlo.`
    );
  }
});
