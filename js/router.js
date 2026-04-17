export function parseRoute(hash = window.location.hash) {
  const normalized = hash.replace(/^#/, "") || "/";
  const segments = normalized.split("/").filter(Boolean);

  if (!segments.length) {
    return { name: "home" };
  }

  if (segments[0] === "create") {
    return { name: "create" };
  }

  if (segments[0] === "insights") {
    return { name: "insights" };
  }

  if (segments[0] === "post" && segments[1]) {
    return { name: "detail", id: segments[1] };
  }

  if (segments[0] === "edit" && segments[1]) {
    return { name: "edit", id: segments[1] };
  }

  return { name: "not-found" };
}
