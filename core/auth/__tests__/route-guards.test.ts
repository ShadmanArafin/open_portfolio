import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import ts from 'typescript';

/**
 * Every mutating endpoint checks authorization itself.
 *
 * This is the mechanism that makes "an unprotected admin route is impossible"
 * true rather than aspirational. A layout guard does not protect a route
 * handler: a handler is a public HTTP endpoint, reachable regardless of what
 * rendered the button that normally calls it, and forgetting `requireOwner()`
 * in a new file produces no error, no warning and no visible symptom — the
 * route simply works for everybody.
 *
 * So it is checked mechanically, on the syntax tree rather than with a text
 * search, and a new route is guarded-by-default: unknown files fail until
 * somebody either adds the check or writes down why it is public.
 */

const ROOT = join(import.meta.dirname, '..', '..', '..');
const API_ROOT = join(ROOT, 'app', 'api');
const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

/**
 * Endpoints that are public on purpose.
 *
 * A reason is mandatory, and it is the only thing standing between this test
 * and being defeated by adding a line. Reviewing a one-line diff that claims
 * "anyone may call this" is a decision somebody has to make out loud.
 */
const PUBLIC_ROUTES: Record<string, string> = {
  'auth/login': 'Signing in cannot require being signed in.',
  'auth/logout': 'Clearing your own session. Nothing to protect.',
  'auth/session': 'Reports whether a session exists. Reveals nothing about content.',
  'auth/reset/request': 'Account recovery, for someone who has lost their way in.',
  'auth/reset/confirm': 'Account recovery. Authorised by the emailed token, not a session.',
  'setup/claim': 'Runs before an owner exists. Guarded by the setup token and a one-time lock.',
  contact: 'The contact form. Visitors are the entire point.',
  'newsletter/subscribe': 'The sign-up form. A visitor asking to hear from the owner.',
  'newsletter/confirm':
    'Completing a sign-up. Authorised by the emailed token, which is the only thing that could be.',
  'newsletter/unsubscribe':
    'Leaving a list. Authorised by the emailed token, and reachable by a mail provider under RFC 8058.',
  'media/[...key]': 'Serves published assets to visitors.',
  'preview/end':
    'Turning your own preview off grants nothing. Requiring a session here would strand someone in preview when it expired.',
};

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry === 'route.ts' || entry === 'route.tsx') out.push(full);
  }
  return out;
}

/** `app/api/admin/messages/[id]/route.ts` -> `admin/messages/[id]`. */
function routeId(file: string): string {
  return relative(API_ROOT, file).split(sep).slice(0, -1).join('/');
}

/** Every function declared at the top level of a file, by name. */
function localFunctions(source: ts.SourceFile): Map<string, ts.Node> {
  const found = new Map<string, ts.Node>();
  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      found.set(statement.name.text, statement);
    } else if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.initializer) found.set(decl.name.text, decl);
      }
    }
  }
  return found;
}

/**
 * Whether a handler reaches `requireOwner()`, directly or through a helper
 * declared in the same file.
 *
 * The first version of this only looked inside the handler body, and reported
 * two routes as unguarded that were guarded perfectly well — both extract the
 * check into a local `guard()` because they need the same six lines twice. A
 * test that fails correct code teaches people to inline things to appease it,
 * and the shape it was pushing them towards was the worse one.
 *
 * One file deep, deliberately. Following imports would mean resolving modules,
 * and a guard that lives in another file is no longer reviewable in the diff
 * that adds the route.
 */
function callsRequireOwner(node: ts.Node, locals: Map<string, ts.Node>): boolean {
  const seen = new Set<string>();

  const search = (root: ts.Node): boolean => {
    let found = false;
    const visit = (child: ts.Node) => {
      if (found) return;
      if (ts.isCallExpression(child) && ts.isIdentifier(child.expression)) {
        const name = child.expression.text;
        if (name === 'requireOwner') {
          found = true;
          return;
        }
        const local = locals.get(name);
        if (local && !seen.has(name)) {
          seen.add(name);
          if (search(local)) {
            found = true;
            return;
          }
        }
      }
      ts.forEachChild(child, visit);
    };
    visit(root);
    return found;
  };

  return search(node);
}

/** Exported HTTP handlers in a route file, in either declaration form. */
function exportedHandlers(source: ts.SourceFile): { method: string; node: ts.Node }[] {
  const handlers: { method: string; node: ts.Node }[] = [];

  for (const statement of source.statements) {
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;
    const exported = modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;

    if (ts.isFunctionDeclaration(statement) && statement.name) {
      if (HTTP_METHODS.has(statement.name.text)) {
        handlers.push({ method: statement.name.text, node: statement });
      }
      continue;
    }

    // `export const POST = async (req) => {}` is the same endpoint.
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && HTTP_METHODS.has(decl.name.text)) {
          handlers.push({ method: decl.name.text, node: decl });
        }
      }
    }
  }

  return handlers;
}

const routeFiles = walk(API_ROOT);

describe('route guards', () => {
  it('finds the API routes at all', () => {
    // A broken walk would make every assertion below vacuously pass, which is
    // the failure mode this whole file exists to prevent elsewhere.
    expect(routeFiles.length).toBeGreaterThan(5);
  });

  it.each(routeFiles.map((file) => [routeId(file), file] as const))(
    '%s checks the owner, or is listed as public',
    (id, file) => {
      const source = ts.createSourceFile(
        file,
        readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true
      );

      const locals = localFunctions(source);
      const handlers = exportedHandlers(source);
      expect(handlers.length, `${id} exports no HTTP handler`).toBeGreaterThan(0);

      const isPublic = id in PUBLIC_ROUTES;
      for (const handler of handlers) {
        const guarded = callsRequireOwner(handler.node, locals);

        if (isPublic) {
          expect(
            PUBLIC_ROUTES[id].length,
            `${id} is listed as public but gives no reason`
          ).toBeGreaterThan(20);
          continue;
        }

        expect(
          guarded,
          `${handler.method} /api/${id} does not call requireOwner(). Either call it, ` +
            'or add the route to PUBLIC_ROUTES with a reason it is safe to expose.'
        ).toBe(true);
      }
    }
  );

  it('has no stale entries in the public list', () => {
    // An allowlist that outlives the file it exempts is how a route ends up
    // exempted by a name it inherited.
    const present = new Set(routeFiles.map(routeId));
    for (const id of Object.keys(PUBLIC_ROUTES)) {
      expect(present.has(id), `PUBLIC_ROUTES lists "${id}", which no longer exists`).toBe(true);
    }
  });
});
