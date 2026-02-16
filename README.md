# Churo Vault

Colección personal de prompts con funcionalidad de copia rápida al portapapeles.

## Descripción

Churo Vault es una aplicación web estática sencilla diseñada para almacenar y visualizar una colección de prompts útiles. Los datos se cargan dinámicamente desde un archivo JSON remoto, asegurando que la colección esté siempre actualizada sin necesidad de modificar el código fuente de la aplicación.

## Características

- **Carga Dinámica:** Obtiene los prompts desde una fuente JSON remota.
- **Copiado Rápido:** Botón dedicado para copiar el contenido del prompt al portapapeles con un solo clic.
- **Feedback Visual:** Notificaciones tipo "toast" y cambios de estado en los botones para confirmar la acción de copiado.
- **Diseño Responsivo:** Grid adaptable para visualización en escritorio y móviles.
- **Accesibilidad:** Uso de etiquetas semánticas y atributos ARIA.

## Tecnologías Utilizadas

- **HTML5:** Estructura semántica.
- **CSS3:** Estilos personalizados, variables CSS y diseño Grid/Flexbox.
- **JavaScript (Vanilla):** Lógica para fetching de datos y manipulación del DOM (sin frameworks).

## Instalación y Uso

1. **Clonar el repositorio:**
```bash
git clone https://github.com/pabcha/churo-vault.git
```

2. **Abrir la aplicación:**
Simplemente abre el archivo `index.html` en tu navegador web preferido. No se requiere servidor de backend ni proceso de construcción.

## Estructura del Proyecto

- `index.html`: Punto de entrada de la aplicación.
- `styles.css`: Hojas de estilo y definiciones de diseño.
- `script.js`: Lógica de la aplicación (fetch de datos, creación de tarjetas, funcionalidad de copiado).

## Fuente de Datos

Los prompts se configuran en el archivo: `https://raw.githubusercontent.com/pabcha/apps-configs/refs/heads/main/churo-vaul.resource.json`
