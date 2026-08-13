# Open Portfolio, as a container.
#
# Why this exists: without it, "self-hosted" means "hosted on Vercel", which is
# not the same thing and is not what the licence promises. This image runs the
# same commit on a VPS, a home server or a Raspberry Pi, with no account
# anywhere and no platform to be turned off by.
#
# Build:  docker build -t open-portfolio .
# Run:    docker run -p 3000:3000 -v opb-data:/data open-portfolio
#
# For a complete setup with a database, use `docker compose up` instead.

# --------------------------------------------------------------- dependencies
FROM node:24-alpine AS deps
WORKDIR /app

# Only the manifests, so this layer is rebuilt when dependencies change and not
# when a line of application code does. It is the slowest step by far.
COPY package.json package-lock.json ./
RUN npm ci

# -------------------------------------------------------------------- builder
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Telemetry off by default. Somebody self-hosting to avoid third parties should
# not have to discover that the build phones home and opt out afterwards.
ENV NEXT_TELEMETRY_DISABLED=1

# Demo builds must carry the flag through the build, not only the run: the demo
# adapter reads a cookie, and that is what stops every page being prerendered
# once and served identically to everybody.
ARG OPB_DEMO_MODE
ENV OPB_DEMO_MODE=$OPB_DEMO_MODE

RUN npm run build

# --------------------------------------------------------------------- runner
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Never root. A container escape is a much shorter walk from a root process,
# and nothing here needs the privilege.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# `standalone` contains the server and only the modules it actually imports;
# `static` and `public` are served from disk and are not traced into it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Where the `local` storage adapter keeps content, uploads and sessions. Mount
# a volume here or everything written is lost when the container is replaced —
# which is exactly the failure the adapter registry refuses to allow silently.
RUN mkdir -p /data && chown nextjs:nodejs /data
VOLUME /data
ENV OPB_DATA_DIR=/data

USER nextjs
EXPOSE 3000

# Answers on the app's own routes, so an orchestrator restarts the container
# when Next.js is wedged rather than only when the process has died.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
