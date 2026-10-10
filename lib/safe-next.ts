/** Only allow same-site relative paths under the given prefix. */
export function safeNext(raw: string | undefined, prefix: string, fallback: string) {
  if (!raw || !raw.startsWith(prefix) || raw.startsWith("//") || raw.includes("\\")) return fallback;
  return raw;
}
