const MEDIA_PATH_PREFIXES = ['/images/', '/videos/', '/uploads/cms/'];

function isPlainObject(value) {
  if (!value || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function isMediaReference(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return (
    MEDIA_PATH_PREFIXES.some((prefix) => trimmed.startsWith(prefix)) ||
    /^https?:\/\//i.test(trimmed)
  );
}

export function collectMediaReferences(value, output = new Set()) {
  if (typeof value === 'string') {
    if (isMediaReference(value)) output.add(value.trim());
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectMediaReferences(item, output);
    return output;
  }
  if (isPlainObject(value)) {
    for (const item of Object.values(value)) {
      collectMediaReferences(item, output);
    }
  }
  return output;
}

export function containsMediaReference(value, candidates) {
  const wanted = candidates instanceof Set ? candidates : new Set(candidates);
  if (typeof value === 'string') return wanted.has(value.trim());
  if (Array.isArray(value)) {
    return value.some((item) => containsMediaReference(item, wanted));
  }
  if (isPlainObject(value)) {
    return Object.values(value).some((item) =>
      containsMediaReference(item, wanted),
    );
  }
  return false;
}

export function rewriteMediaReferences(value, replacements, stats) {
  if (typeof value === 'string') {
    const replacement = replacements.get(value.trim());
    if (replacement) {
      if (stats) stats.replaced = (stats.replaced || 0) + 1;
      return replacement;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      rewriteMediaReferences(item, replacements, stats),
    );
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        rewriteMediaReferences(item, replacements, stats),
      ]),
    );
  }
  return value;
}
