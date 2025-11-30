/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  // aquí puedes añadir más variables si tienes:
  // readonly VITE_OTRA_COSA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
