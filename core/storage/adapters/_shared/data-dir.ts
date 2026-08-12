import 'server-only';
import path from 'node:path';

/**
 * Where this install may write.
 *
 * One function, shared by every adapter that touches a disk, because the two
 * that did it separately drifted — and the way that surfaced was the documented
 * `docker compose up` failing with `EACCES: mkdir '/app/.opb'` on the very
 * first write. The Postgres adapter had hard-coded `process.cwd()`, which
 * inside the image is the application directory, owned by root and read-only to
 * the user the app runs as.
 *
 * `OPB_DATA_DIR` exists for exactly that case: an image's working directory is
 * replaced every time it is rebuilt, so writing there means a deploy quietly
 * deletes somebody's uploads even where it is permitted. The volume has to be
 * mounted somewhere that outlives the container, and the app has to be told
 * where.
 */
export function dataRoot(): string {
  return process.env.OPB_DATA_DIR
    ? path.resolve(process.env.OPB_DATA_DIR)
    : path.join(process.cwd(), '.opb');
}

/** Where uploads live, under whichever root this install is using. */
export function mediaRoot(): string {
  return path.join(dataRoot(), 'media');
}
