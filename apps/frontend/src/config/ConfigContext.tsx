import { PropsWithChildren, createContext, useContext } from 'react';
import type { AppConfig } from './config.ts';

const ConfigContext = createContext<AppConfig | undefined>(undefined);

export function ConfigProvider({ value, children }: PropsWithChildren<{ value: AppConfig }>): JSX.Element {
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useAppConfig(): AppConfig {
  const context = useContext(ConfigContext);

  if (!context) {
    throw new Error('useAppConfig must be used within a ConfigProvider');
  }

  return context;
}
