# PulseBlog

Aplicación web tipo blog construida con HTML, CSS y JavaScript Vanilla que implementa CRUD completo sobre una API REST. El proyecto fue diseñado para cumplir los requerimientos del Proyecto 1 de Sistemas y Tecnologías Web.

## Integrantes

- Karen

## API utilizada

- DummyJSON: `https://dummyjson.com`
- Endpoints usados:
  - `GET /posts`
  - `GET /posts/:id`
  - `POST /posts/add`
  - `PATCH /posts/:id`
  - `DELETE /posts/:id`
  - `GET /users`

## Funcionalidades implementadas

- Listado principal de publicaciones con paginación de 10 elementos por página.
- Vista de detalle con al menos 6 campos del recurso.
- Creación de publicaciones con validación completa desde JavaScript.
- Edición de publicaciones usando `PATCH`.
- Eliminación con confirmación previa.
- Filtros combinables por texto, autor y etiqueta.
- Estados de carga, error, éxito y vacío.
- Navegación entre Inicio, Crear publicación, Detalle y una sección adicional.
- Sección adicional: `Insights`, con métricas rápidas y favoritos persistidos en `localStorage`.
- Código organizado en módulos (`api.js`, `ui.js`, `validation.js`, `router.js`, `state.js`, `main.js`).

## Estructura

```text
Proyecto-web-1/
├── index.html
├── .gitignore
├── README.md
├── css/
│   ├── main.css
│   ├── layout.css
│   └── components.css
└── js/
    ├── api.js
    ├── main.js
    ├── router.js
    ├── state.js
    ├── ui.js
    └── validation.js
```

## Cómo correr el proyecto

1. Abre esta carpeta en VS Code.
2. Ejecuta un servidor local simple.
3. Abre `index.html` desde ese servidor.

Opciones recomendadas:

- Con VS Code y Live Server.
- Con Python:

```bash
python -m http.server 5500
```

Luego abre:

```text
http://localhost:5500
```

## Decisión de diseño

La sección adicional elegida fue `Insights` porque aporta valor real al usuario: resume estadísticas del contenido, muestra el top de publicaciones con más likes y permite mantener una lista de favoritos para explorar mejor el contenido.

## Screenshot

Agrega aquí una captura de pantalla de la aplicación una vez la abras en el navegador.
