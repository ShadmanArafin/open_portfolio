/**
 * `id` values only need to be unique within the content tree.
 *
 * In its own module because the editor files it is used from are components,
 * and a component file that also exports plain functions breaks fast refresh.
 */
let idCounter = 0;

export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${++idCounter}`;
