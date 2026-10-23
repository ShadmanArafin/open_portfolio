import { serializeJsonLd } from './json-ld';

/** A JSON-LD block, escaped (see `serializeJsonLd`). Renders nothing for null. */
export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
