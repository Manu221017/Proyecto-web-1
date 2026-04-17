function isBlank(value) {
  return !value || !value.trim();
}

export function validatePostForm(data) {
  const errors = {};

  if (isBlank(data.title)) {
    errors.title = "El título es obligatorio.";
  } else if (data.title.trim().length < 5) {
    errors.title = "El título debe tener al menos 5 caracteres.";
  }

  if (isBlank(data.body)) {
    errors.body = "El contenido es obligatorio.";
  } else if (data.body.trim().length < 20) {
    errors.body = "El contenido debe tener al menos 20 caracteres.";
  }

  if (isBlank(data.authorName)) {
    errors.authorName = "El nombre del autor es obligatorio.";
  } else if (data.authorName.trim().length < 3) {
    errors.authorName = "El nombre del autor debe tener al menos 3 caracteres.";
  }

  return errors;
}
