/**
 * Sanitize a string to prevent NoSQL / regex injection.
 * Escapes regex special characters when used in $regex queries.
 */
const escapeRegex = (str) => {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Whitelist a value against allowed values.
 * Returns undefined if value is not in the allowed list.
 */
const whitelistValue = (value, allowed) => {
  if (!value) return undefined;
  return allowed.includes(value) ? value : undefined;
};

module.exports = { escapeRegex, whitelistValue };
