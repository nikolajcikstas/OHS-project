/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_USE_STUBS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
