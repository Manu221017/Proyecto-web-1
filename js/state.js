const FAVORITES_KEY = "pulseblog-favorites";

export const state = {
  posts: [],
  users: [],
  filters: {
    query: "",
    author: "all",
    tag: "all",
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
  },
  favorites: loadFavorites(),
};

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
}

export function setPosts(posts) {
  state.posts = posts;
}

export function setUsers(users) {
  state.users = users;
}

export function setFilters(nextFilters) {
  state.filters = { ...state.filters, ...nextFilters };
}

export function setPage(page) {
  state.pagination.currentPage = page;
}

export function addPost(post) {
  state.posts = [post, ...state.posts];
}

export function patchPost(postId, updates) {
  state.posts = state.posts.map((post) =>
    Number(post.id) === Number(postId) ? { ...post, ...updates } : post
  );
}

export function removePost(postId) {
  state.posts = state.posts.filter((post) => Number(post.id) !== Number(postId));
  state.favorites = state.favorites.filter((id) => Number(id) !== Number(postId));
  persistFavorites();
}

export function toggleFavorite(postId) {
  const postNumber = Number(postId);
  const exists = state.favorites.includes(postNumber);

  state.favorites = exists
    ? state.favorites.filter((id) => id !== postNumber)
    : [...state.favorites, postNumber];

  persistFavorites();
  return !exists;
}

export function isFavorite(postId) {
  return state.favorites.includes(Number(postId));
}

export function getAuthorName(postOrUserId) {
  if (typeof postOrUserId === "object" && postOrUserId !== null) {
    if (postOrUserId.authorName) {
      return postOrUserId.authorName;
    }

    const user = state.users.find((entry) => Number(entry.id) === Number(postOrUserId.userId));
    return user ? `${user.firstName} ${user.lastName}` : "Autor desconocido";
  }

  const user = state.users.find((entry) => Number(entry.id) === Number(postOrUserId));
  return user ? `${user.firstName} ${user.lastName}` : "Autor desconocido";
}

export function getUniqueAuthors() {
  return [...new Set(state.posts.map((post) => getAuthorName(post)))]
    .map((name) => ({ id: name, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function getUniqueTags() {
  return [...new Set(state.posts.flatMap((post) => post.tags || []))].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

export function getFilteredPosts() {
  const { query, author, tag } = state.filters;
  const normalizedQuery = query.trim().toLowerCase();

  return state.posts.filter((post) => {
    const matchesQuery =
      !normalizedQuery ||
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.body.toLowerCase().includes(normalizedQuery);

    const matchesAuthor = author === "all" || getAuthorName(post) === author;
    const matchesTag = tag === "all" || (post.tags || []).includes(tag);

    return matchesQuery && matchesAuthor && matchesTag;
  });
}

export function getPaginatedPosts(posts = getFilteredPosts()) {
  const { currentPage, pageSize } = state.pagination;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: posts.slice(start, end),
    total: posts.length,
    totalPages: Math.max(1, Math.ceil(posts.length / pageSize)),
  };
}

export function getPostById(postId) {
  return state.posts.find((post) => Number(post.id) === Number(postId));
}

export function getInsights() {
  const filtered = getFilteredPosts();
  const postsWithReactions = state.posts.filter((post) => Number(post.reactions?.likes || 0) > 0);
  const topLiked = [...state.posts]
    .sort((a, b) => Number(b.reactions?.likes || 0) - Number(a.reactions?.likes || 0))
    .slice(0, 5);

  return {
    totalPosts: state.posts.length,
    totalAuthors: new Set(state.posts.map((post) => getAuthorName(post))).size,
    totalTags: getUniqueTags().length,
    filteredCount: filtered.length,
    favoritesCount: state.favorites.length,
    engagementCount: postsWithReactions.length,
    topLiked,
  };
}
