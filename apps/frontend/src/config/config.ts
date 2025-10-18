export interface OidcConfiguration {
  authority: string;
  clientId: string;
  redirectUri: string;
  silentRedirectUri: string;
  postLogoutRedirectUri: string;
  scope: string;
  responseType?: string;
  automaticSilentRenew?: boolean;
}

export interface AppConfig {
  oidc: OidcConfiguration;
}

type PartialConfig = Partial<AppConfig> & { oidc?: Partial<OidcConfiguration> };

const DEFAULT_CONFIG = (origin: string): AppConfig => ({
  oidc: {
    authority: '',
    clientId: '',
    redirectUri: `${origin}/callback`,
    silentRedirectUri: `${origin}/silent-renew`,
    postLogoutRedirectUri: `${origin}/`,
    scope: 'openid profile email',
    responseType: 'code',
    automaticSilentRenew: true
  }
});

async function fetchRuntimeConfig(): Promise<PartialConfig> {
  try {
    const response = await fetch('/config/config.json', {
      cache: 'no-store'
    });

    if (!response.ok) {
      return {};
    }

    return (await response.json()) as PartialConfig;
  } catch (error) {
    console.warn('Unable to fetch runtime configuration. Falling back to environment variables.', error);
    return {};
  }
}

function getEnvOverrides(): PartialConfig {
  const env = import.meta.env;

  const oidc: Partial<OidcConfiguration> = {};

  if (env.VITE_OIDC_AUTHORITY) {
    oidc.authority = env.VITE_OIDC_AUTHORITY as string;
  }
  if (env.VITE_OIDC_CLIENT_ID) {
    oidc.clientId = env.VITE_OIDC_CLIENT_ID as string;
  }
  if (env.VITE_OIDC_REDIRECT_URI) {
    oidc.redirectUri = env.VITE_OIDC_REDIRECT_URI as string;
  }
  if (env.VITE_OIDC_SILENT_REDIRECT_URI) {
    oidc.silentRedirectUri = env.VITE_OIDC_SILENT_REDIRECT_URI as string;
  }
  if (env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI) {
    oidc.postLogoutRedirectUri = env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI as string;
  }
  if (env.VITE_OIDC_SCOPE) {
    oidc.scope = env.VITE_OIDC_SCOPE as string;
  }
  if (env.VITE_OIDC_RESPONSE_TYPE) {
    oidc.responseType = env.VITE_OIDC_RESPONSE_TYPE as string;
  }

  return Object.keys(oidc).length > 0 ? { oidc } : {};
}

function mergeConfigs(base: AppConfig, overlay: PartialConfig): AppConfig {
  return {
    oidc: {
      ...base.oidc,
      ...overlay.oidc
    }
  };
}

function validateConfig(config: AppConfig): void {
  const requiredFields: Array<keyof OidcConfiguration> = [
    'authority',
    'clientId',
    'redirectUri',
    'silentRedirectUri',
    'postLogoutRedirectUri',
    'scope'
  ];

  const missing = requiredFields.filter((field) => !config.oidc[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required OIDC configuration values: ${missing.join(', ')}`);
  }
}

export async function loadRuntimeConfig(): Promise<AppConfig> {
  const origin = window.location.origin;
  const defaults = DEFAULT_CONFIG(origin);
  const runtimeConfig = await fetchRuntimeConfig();
  const envOverrides = getEnvOverrides();

  const config = mergeConfigs(defaults, runtimeConfig);
  const finalConfig = mergeConfigs(config, envOverrides);

  validateConfig(finalConfig);

  return finalConfig;
}
