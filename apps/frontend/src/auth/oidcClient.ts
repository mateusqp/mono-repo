import { UserManager, WebStorageStateStore, type UserManagerSettings } from 'oidc-client-ts';
import type { AppConfig, OidcConfiguration } from '../config/config.ts';

const STORAGE_KEY_PREFIX = 'frontend-oidc';

function buildSettings(config: OidcConfiguration): UserManagerSettings {
  return {
    authority: config.authority,
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    post_logout_redirect_uri: config.postLogoutRedirectUri,
    silent_redirect_uri: config.silentRedirectUri,
    scope: config.scope,
    response_type: config.responseType ?? 'code',
    automaticSilentRenew: config.automaticSilentRenew ?? true,
    loadUserInfo: true,
    userStore: new WebStorageStateStore({
      store: window.localStorage,
      prefix: STORAGE_KEY_PREFIX
    })
  };
}

export function createUserManager(appConfig: AppConfig): UserManager {
  const settings = buildSettings(appConfig.oidc);
  return new UserManager(settings);
}
