import { createPost, deletePost, fetchAllPosts, fetchPostById, fetchUsers, updatePost } from "./api.js";
import { parseRoute } from "./router.js";
import {
  addPost,
  getAuthorName,
  getPostById,
  patchPost,
  removePost,
  setFilters,
  setPage,
  setPosts,
  setUsers,
  state,
  toggleFavorite,
} from "./state.js";
import { validatePostForm } from "./validation.js";
import {
  renderDetailView,
  renderEmptyState,
  renderErrorState,
  renderFormView,
  renderHomeView,
  renderInsightsView,
  renderSkeletonList,
  renderSpinner,
  setActiveNav,
  showToast,
  syncQuickStats,
} from "./ui.js";

async function bootstrap() {
  renderSkeletonList();

  try {
    const [posts, users] = await Promise.all([fetchAllPosts(), fetchUsers()]);
    setUsers(users);
    setPosts(
      posts.map((post) => ({
        ...post,
        authorName: getAuthorName(post),
      }))
    );
    syncQuickStats();
    renderRoute();
  } catch (error) {
    renderErrorState(
      `No se pudieron cargar los datos iniciales desde la API. ${error.message}`,
      bootstrap
    );
  }
}

function renderRoute() {
  const route = parseRoute();
  setActiveNav(window.location.hash || "#/");

  switch (route.name) {
    case "home":
      if (!state.posts.length) {
        renderEmptyState("No hay publicaciones disponibles en este momento.");
      } else {
        renderHomeView();
      }
      break;
    case "detail":
      renderDetailRoute(route.id);
      break;
    case "create":
      renderFormView({
        mode: "create",
        values: { title: "", body: "", authorName: "", tags: [] },
        submitLabel: "Publicar",
      });
      break;
    case "edit":
      renderEditRoute(route.id);
      break;
    case "insights":
      renderInsightsView();
      break;
    default:
      renderEmptyState("La vista solicitada no existe. Regresa al inicio para continuar.");
  }
}

async function renderDetailRoute(postId) {
  const cached = getPostById(postId);

  if (cached) {
    renderDetailView(postId);
    return;
  }

  try {
    renderSpinner();
    const post = await fetchPostById(postId);
    addPost({
      ...post,
      authorName: getAuthorName(post),
    });
    renderDetailView(postId);
    syncQuickStats();
  } catch (error) {
    renderErrorState(`No se pudo cargar el detalle de la publicación. ${error.message}`, renderRoute);
  }
}

function renderEditRoute(postId) {
  const post = getPostById(postId);

  if (!post) {
    renderEmptyState("No pudimos encontrar la publicación que deseas editar.");
    return;
  }

  renderFormView({
    mode: "edit",
    values: {
      id: post.id,
      title: post.title,
      body: post.body,
      authorName: post.authorName || getAuthorName(post),
      tags: post.tags || [],
    },
    submitLabel: "Guardar cambios",
  });
}

function getFormValues(form) {
  const formData = new FormData(form);
  const tagsRaw = String(formData.get("tags") || "");

  return {
    title: String(formData.get("title") || "").trim(),
    body: String(formData.get("body") || "").trim(),
    authorName: String(formData.get("authorName") || "").trim(),
    tags: tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

function attachEventDelegation() {
  document.addEventListener("submit", async (event) => {
    if (event.target.id === "filtersForm") {
      event.preventDefault();
      const formData = new FormData(event.target);
      setFilters({
        query: String(formData.get("query") || ""),
        author: String(formData.get("author") || "all"),
        tag: String(formData.get("tag") || "all"),
      });
      setPage(1);
      renderHomeView();
      return;
    }

    if (event.target.id === "postForm") {
      event.preventDefault();
      const form = event.target;
      const route = parseRoute();
      const values = getFormValues(form);
      const errors = validatePostForm(values);

      if (Object.keys(errors).length) {
        renderFormView({
          mode: route.name === "edit" ? "edit" : "create",
          values: route.name === "edit" ? { ...values, id: route.id } : values,
          errors,
          submitLabel: route.name === "edit" ? "Guardar cambios" : "Publicar",
        });
        showToast("Corrige los campos marcados antes de continuar.", "error");
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = route.name === "edit" ? "Guardando..." : "Publicando...";
      }

      try {
        if (route.name === "edit") {
          const existing = getPostById(route.id);
          const updatedPost = await updatePost(route.id, {
            title: values.title,
            body: values.body,
            tags: values.tags,
          });

          patchPost(route.id, {
            ...existing,
            ...updatedPost,
            authorName: values.authorName,
          });

          syncQuickStats();
          showToast("La publicación fue actualizada correctamente.");
          window.location.hash = `#/post/${route.id}`;
        } else {
          const createdPost = await createPost({
            title: values.title,
            body: values.body,
            userId: state.users[0]?.id || 1,
            tags: values.tags,
          });

          addPost({
            ...createdPost,
            authorName: values.authorName,
            reactions: { likes: 0, dislikes: 0 },
            views: 0,
          });

          setPage(1);
          syncQuickStats();
          showToast("La publicación fue creada con éxito.");
          renderFormView({
            mode: "create",
            values: { title: "", body: "", authorName: "", tags: [] },
            submitLabel: "Publicar",
          });
        }
      } catch (error) {
        showToast(`La operación no pudo completarse. ${error.message}`, "error");
        renderFormView({
          mode: route.name === "edit" ? "edit" : "create",
          values: route.name === "edit" ? { ...values, id: route.id } : values,
          submitLabel: route.name === "edit" ? "Guardar cambios" : "Publicar",
        });
      }
    }
  });

  document.addEventListener("click", async (event) => {
    const favoriteButton = event.target.closest("[data-favorite-toggle]");
    if (favoriteButton) {
      const postId = favoriteButton.dataset.favoriteToggle;
      const nowFavorite = toggleFavorite(postId);
      syncQuickStats();
      showToast(
        nowFavorite ? "Se agregó a favoritos." : "Se eliminó de favoritos.",
        "success"
      );
      renderRoute();
      return;
    }

    const paginationButton = event.target.closest("[data-page-action]");
    if (paginationButton) {
      const action = paginationButton.dataset.pageAction;
      const currentPage = state.pagination.currentPage;
      setPage(action === "next" ? currentPage + 1 : currentPage - 1);
      renderHomeView();
      return;
    }

    const clearFiltersButton = event.target.closest("[data-clear-filters]");
    if (clearFiltersButton) {
      setFilters({ query: "", author: "all", tag: "all" });
      setPage(1);
      renderHomeView();
      return;
    }

    const deleteButton = event.target.closest("[data-delete-post]");
    if (deleteButton) {
      const postId = deleteButton.dataset.deletePost;
      const confirmed = window.confirm(
        "¿Seguro que deseas eliminar esta publicación? Esta acción no se puede deshacer."
      );

      if (!confirmed) {
        return;
      }

      try {
        await deletePost(postId);
        removePost(postId);
        syncQuickStats();
        showToast("La publicación fue eliminada exitosamente.");
        window.location.hash = "#/";
      } catch (error) {
        showToast(`No se pudo eliminar la publicación. ${error.message}`, "error");
      }
    }
  });

  window.addEventListener("hashchange", renderRoute);
}

attachEventDelegation();
bootstrap();
