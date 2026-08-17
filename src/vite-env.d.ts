/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Empty/missing means no real ad unit is configured yet — ad slots render nothing. */
  readonly VITE_ADSENSE_PUBLISHER_ID: string;
  /** Empty/missing means GA4 is not configured yet — the gtag.js snippet never loads. */
  readonly VITE_GA_MEASUREMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
