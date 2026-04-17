import {
  getAuthorName,
  getFilteredPosts,
  getInsights,
  getPaginatedPosts,
  getPostById,
  getUniqueAuthors,
  getUniqueTags,
  isFavorite,
  state,
} from "./state.js";

const app = document.querySelector("#app");
const toastRegion = document.querySelector("#toastRegion");
const quickStats = {
  posts: document.querySelector("#statPosts"),
  authors: document.querySelector("#statAuthors"),
  favorites: document.querySelector("#statFavorites"),
};

function truncate(text, maxLength = 140) {
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

function postCardTemplate(post) {
  const likedCount = Number(post.reactions?.likes || 0);
  const dislikedCount = Number(post.reactions?.dislikes || 0);
  const favoriteText = isFavorite(post.id) ? "Quitar favorito" : "Favorito";

  return `
    <article class="post-card">
      <div class="list-meta">
        <span class="state-badge">${getAuthorName(post)}</span>
        <span class="tag">#${post.id}</span>
      </div>
      <div>
        <h3>${post.title}</h3>
        <p>${truncate(post.body)}</p>
      </div>
      <div class="tag-list">
        ${(post.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
      <div class="list-meta">
        <span>${likedCount} likes</span>
        <span>${dislikedCount} dislikes</span>
      </div>
      <div class="btn-row">
        <a class="btn btn--primary" href="#/post/${post.id}">Ver detalle</a>
        <button class="btn btn--secondary" data-favorite-toggle="${post.id}">${favoriteText}</button>
      </div>
    </article>
  `;
}

function renderPagination(currentPage, totalPages) {
  return `
    <div class="pagination">
      <button class="btn btn--secondary" data-page-action="prev" ${currentPage === 1 ? "disabled" : ""}>
        Anterior
      </button>
      <span>Página ${currentPage} de ${totalPages}</span>
      <button class="btn btn--secondary" data-page-action="next" ${currentPage === totalPages ? "disabled" : ""}>
        Siguiente
      </button>
    </div>
  `;
}

export function renderHomeView() {
  const filteredPosts = getFilteredPosts();
  const { currentPage } = state.pagination;
  const { items, totalPages } = getPaginatedPosts(filteredPosts);

  app.innerHTML = `
    <section class="panel hero-panel">
      <div class="hero-panel__top">
        <div>
          <div class="hero-panel__eyebrow">Inicio</div>
          <h2>Listado de publicaciones</h2>
          <p>Consulta publicaciones, filtra por distintos criterios y navega por páginas de 10 elementos.</p>
        </div>
        <a class="btn btn--primary" href="#/create">Nueva publicación</a>
      </div>

      <section class="summary-grid">
        <article class="summary-card">
          <span>Resultados visibles</span>
          <strong>${filteredPosts.length}</strong>
        </article>
        <article class="summary-card">
          <span>Autores disponibles</span>
          <strong>${getUniqueAuthors().length}</strong>
        </article>
        <article class="summary-card">
          <span>Etiquetas</span>
          <strong>${getUniqueTags().length}</strong>
        </article>
      </section>
    </section>

    <section class="panel">
      <form id="filtersForm" class="filters-grid">
        <div class="field">
          <label for="searchInput">Buscar por texto</label>
          <input
            id="searchInput"
            type="search"
            name="query"
            value="${state.filters.query}"
            placeholder="Título o contenido"
          >
        </div>
        <div class="field">
          <label for="authorFilter">Autor</label>
          <select id="authorFilter" name="author">
            <option value="all">Todos</option>
            ${getUniqueAuthors()
              .map(
                (author) =>
                  `<option value="${author.id}" ${author.id === state.filters.author ? "selected" : ""}>${author.name}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="field">
          <label for="tagFilter">Etiqueta</label>
          <select id="tagFilter" name="tag">
            <option value="all">Todas</option>
            ${getUniqueTags()
              .map(
                (tag) =>
                  `<option value="${tag}" ${tag === state.filters.tag ? "selected" : ""}>${tag}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="btn-row">
          <button class="btn btn--primary" type="submit">Aplicar filtros</button>
          <button class="btn btn--ghost" type="button" data-clear-filters>Limpiar</button>
        </div>
      </form>
    </section>

    ${
      items.length
        ? `
          <section class="list-grid">
            ${items.map(postCardTemplate).join("")}
          </section>
          <section class="panel">
            ${renderPagination(currentPage, totalPages)}
          </section>
        `
        : `
          <section class="panel panel--centered">
            <div class="state-badge">Estado vacío</div>
            <h2>No hay coincidencias</h2>
            <p>Prueba con otro texto, autor o etiqueta para encontrar publicaciones.</p>
          </section>
        `
    }
  `;
}

export function renderDetailView(postId) {
  const post = getPostById(postId);

  if (!post) {
    renderEmptyState("La publicación que buscas no existe o fue eliminada.");
    return;
  }

  const authorName = getAuthorName(post);
  const favoriteText = isFavorite(post.id) ? "Quitar de favoritos" : "Agregar a favoritos";

  app.innerHTML = `
    <section class="panel">
      <div class="btn-row">
        <a class="btn btn--secondary" href="#/">Regresar al listado</a>
        <a class="btn btn--primary" href="#/edit/${post.id}">Editar publicación</a>
        <button class="btn btn--danger" data-delete-post="${post.id}">Eliminar</button>
      </div>
    </section>

    <section class="detail-grid">
      <article class="panel detail-card">
        <div class="state-badge">Detalle</div>
        <h2>${post.title}</h2>
        <p>${post.body}</p>

        <div class="tag-list">
          ${(post.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>

        <div class="detail-actions">
          <button class="btn btn--secondary" data-favorite-toggle="${post.id}">${favoriteText}</button>
        </div>
      </article>

      <aside class="detail-side">
        <section class="summary-card">
          <h3>Resumen técnico</h3>
          <div class="detail-meta">
            <article>
              <span>ID</span>
              <strong>${post.id}</strong>
            </article>
            <article>
              <span>Autor</span>
              <strong>${authorName}</strong>
            </article>
            <article>
              <span>Likes</span>
              <strong>${Number(post.reactions?.likes || 0)}</strong>
            </article>
            <article>
              <span>Dislikes</span>
              <strong>${Number(post.reactions?.dislikes || 0)}</strong>
            </article>
            <article>
              <span>Vistas</span>
              <strong>${Number(post.views || 0)}</strong>
            </article>
            <article>
              <span>Etiquetas</span>
              <strong>${(post.tags || []).length}</strong>
            </article>
          </div>
        </section>
      </aside>
    </section>
  `;
}

export function renderFormView({ mode = "create", values = {}, errors = {}, submitLabel = "Guardar" }) {
  const isEdit = mode === "edit";
  const heading = isEdit ? "Editar publicación" : "Crear publicación";
  const helper = isEdit
    ? "Modifica el título, contenido o autor y guarda los cambios usando PATCH."
    : "Completa el formulario para enviar una nueva publicación con POST.";

  app.innerHTML = `
    <section class="panel hero-panel">
      <div class="hero-panel__eyebrow">${isEdit ? "Actualizar" : "Crear"}</div>
      <h2>${heading}</h2>
      <p>${helper}</p>
    </section>

    <section class="panel">
      <form id="postForm" novalidate>
        <div class="form-grid">
          <div class="field ${errors.title ? "field--error" : ""}">
            <label for="title">Título</label>
            <input id="title" name="title" value="${values.title || ""}" placeholder="Escribe un buen titular">
            <small class="inline-error" data-error-for="title">${errors.title || ""}</small>
          </div>

          <div class="field ${errors.authorName ? "field--error" : ""}">
            <label for="authorName">Nombre del autor</label>
            <input id="authorName" name="authorName" value="${values.authorName || ""}" placeholder="Nombre del autor">
            <small class="inline-error" data-error-for="authorName">${errors.authorName || ""}</small>
          </div>

          <div class="field field--full ${errors.body ? "field--error" : ""}">
            <label for="body">Contenido</label>
            <textarea id="body" name="body" placeholder="Redacta el contenido completo de la publicación">${values.body || ""}</textarea>
            <small class="inline-error" data-error-for="body">${errors.body || ""}</small>
          </div>

          <div class="field">
            <label for="tags">Etiquetas</label>
            <input id="tags" name="tags" value="${(values.tags || []).join(", ")}" placeholder="tech, life, updates">
            <small class="helper-text">Separadas por comas. Son opcionales pero ayudan al filtrado.</small>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn btn--primary" type="submit">${submitLabel}</button>
          <a class="btn btn--secondary" href="${isEdit ? `#/post/${values.id}` : "#/"}">Cancelar</a>
        </div>
      </form>
    </section>
  `;
}

export function renderInsightsView() {
  const insights = getInsights();
  const favorites = state.posts.filter((post) => isFavorite(post.id));

  app.innerHTML = `
    <section class="panel hero-panel">
      <div class="hero-panel__eyebrow">Sección adicional</div>
      <h2>Insights editoriales</h2>
      <p>
        Esta sección agrega valor al proyecto mostrando métricas rápidas y una colección
        de publicaciones marcadas como favoritas por el usuario.
      </p>
    </section>

    <section class="insights-grid">
      <article class="insight-card">
        <span>Total de publicaciones</span>
        <strong>${insights.totalPosts}</strong>
      </article>
      <article class="insight-card">
        <span>Autores distintos</span>
        <strong>${insights.totalAuthors}</strong>
      </article>
      <article class="insight-card">
        <span>Etiquetas distintas</span>
        <strong>${insights.totalTags}</strong>
      </article>
      <article class="insight-card">
        <span>Resultados filtrados</span>
        <strong>${insights.filteredCount}</strong>
      </article>
      <article class="insight-card">
        <span>Favoritos guardados</span>
        <strong>${insights.favoritesCount}</strong>
      </article>
      <article class="insight-card">
        <span>Posts con likes</span>
        <strong>${insights.engagementCount}</strong>
      </article>
    </section>

    <section class="panel">
      <h3>Top publicaciones por likes</h3>
      <div class="list-grid">
        ${insights.topLiked.map(postCardTemplate).join("")}
      </div>
    </section>

    <section class="panel">
      <h3>Favoritos del usuario</h3>
      ${
        favorites.length
          ? `<div class="list-grid">${favorites.map(postCardTemplate).join("")}</div>`
          : `<p class="helper-text">Aún no has marcado publicaciones como favoritas.</p>`
      }
    </section>
  `;
}

export function renderSkeletonList() {
  app.innerHTML = `
    <section class="panel hero-panel">
      <div class="hero-panel__eyebrow">Cargando</div>
      <h2>Preparando publicaciones</h2>
      <p>Estamos consultando la API y armando el listado para ti.</p>
    </section>
    <section class="skeleton-grid">
      ${Array.from({ length: 6 }, () => '<div class="skeleton-card"></div>').join("")}
    </section>
  `;
}

export function renderSpinner() {
  const template = document.querySelector("#spinnerTemplate");
  app.replaceChildren(template.content.cloneNode(true));
}

export function renderErrorState(message, onRetry) {
  const template = document.querySelector("#errorTemplate");
  const fragment = template.content.cloneNode(true);
  fragment.querySelector("[data-error-message]").textContent = message;

  app.replaceChildren(fragment);

  const retryButton = app.querySelector("[data-retry-button]");
  if (retryButton && typeof onRetry === "function") {
    retryButton.addEventListener("click", onRetry);
  }
}

export function renderEmptyState(message) {
  const template = document.querySelector("#emptyTemplate");
  const fragment = template.content.cloneNode(true);
  fragment.querySelector("[data-empty-message]").textContent = message;
  app.replaceChildren(fragment);
}

export function showToast(message, type = "success") {
  const toast = document.createElement("article");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;

  toastRegion.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3200);
}

export function syncQuickStats() {
  const insights = getInsights();
  quickStats.posts.textContent = String(insights.totalPosts);
  quickStats.authors.textContent = String(insights.totalAuthors);
  quickStats.favorites.textContent = String(insights.favoritesCount);
}

export function setActiveNav(hash) {
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const href = link.getAttribute("href");
    const normalizedHash = hash.startsWith("#/post") || hash.startsWith("#/edit")
      ? "#/"
      : hash || "#/";
    link.classList.toggle("is-active", href === normalizedHash);
  });
}
