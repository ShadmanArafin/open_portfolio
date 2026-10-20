/**
 * Structured data, made safe to drop inside a `<script>` element.
 *
 * `JSON.stringify` escapes quotes, not markup: a headline reading
 * `</script><script>…` closes the tag and runs whatever follows. Titles are
 * not only typed by the owner — Markdown import reads them out of other
 * people's files — so every JSON-LD block goes through here. Escaping `<` as
 * `<` is what the Next.js JSON-LD guide prescribes; the JSON means the
 * same thing to a crawler either way.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
