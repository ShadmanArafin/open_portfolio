/**
 * The one shape the demo defines for itself.
 *
 * Everything else it needs — the block definitions, the theme presets, the
 * profession vocabulary, the primitives that render a band — is imported from
 * the product rather than reproduced here, so what a visitor sees in the demo
 * is what the product actually does. A look-alike would be easier to build and
 * would start lying the first time somebody changed a block.
 */
export interface PageBlock {
  id: string;
  type: string;
  v: number;
  props: Record<string, unknown>;
  frame?: Record<string, unknown>;
  hidden?: boolean;
}
