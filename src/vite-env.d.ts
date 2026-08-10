/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional. When set, the admin login also checks the email field. */
  readonly VITE_ADMIN_EMAIL?: string;
  /** Required to sign in to /admin. Set in .env.local. */
  readonly VITE_ADMIN_PASSCODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
