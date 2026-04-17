const BASE_URL = "https://dummyjson.com";
const POSTS_BATCH_SIZE = 50;

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = "La solicitud no pudo completarse.";

    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(`${message} (HTTP ${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function fetchUsers() {
  const firstPage = await request("/users?limit=100&skip=0");
  const users = [...firstPage.users];

  for (let skip = users.length; skip < firstPage.total; skip += 100) {
    const page = await request(`/users?limit=100&skip=${skip}`);
    users.push(...page.users);
  }

  return users;
}

export async function fetchAllPosts() {
  const firstPage = await request(`/posts?limit=${POSTS_BATCH_SIZE}&skip=0`);
  const posts = [...firstPage.posts];

  for (let skip = posts.length; skip < firstPage.total; skip += POSTS_BATCH_SIZE) {
    const page = await request(`/posts?limit=${POSTS_BATCH_SIZE}&skip=${skip}`);
    posts.push(...page.posts);
  }

  return posts;
}

export function fetchPostById(postId) {
  return request(`/posts/${postId}`);
}

export function createPost(payload) {
  return request("/posts/add", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePost(postId, payload) {
  return request(`/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deletePost(postId) {
  return request(`/posts/${postId}`, {
    method: "DELETE",
  });
}
