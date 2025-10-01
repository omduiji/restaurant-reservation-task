/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FOODICS_API_TOKEN: string
  readonly VITE_FOODICS_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
