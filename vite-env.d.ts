/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOUBAO_ACCESS_KEY_ID: string
  readonly VITE_DOUBAO_SECRET_ACCESS_KEY: string
  readonly VITE_DOUBAO_MODEL_ENDPOINT: string
  readonly VITE_DOUBAO_BASE_URL: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
