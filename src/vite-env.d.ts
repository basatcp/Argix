/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONSULTATION_PROVIDER?: string;
  readonly VITE_CONSULTATION_ENDPOINT?: string;
  readonly VITE_HUBSPOT_PORTAL_ID?: string;
  readonly VITE_HUBSPOT_FORM_ID?: string;
  readonly VITE_CONSULTATION_DEMO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
