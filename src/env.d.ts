declare global {
  interface ImportMetaEnv {
    env: {
      VITE_APP_NAME: string
      VITE_APP_TAGLINE: string
      VITE_APP_INFURA_ID: string
      VITE_APP_INDEX_HOST: string
      VITE_APP_INDEX_API_PATH: string
      VITE_APP_GATEWAY_HOST: string
      VITE_APP_GATEWAY_API_PATH: string
      VITE_APP_AUTH_HOST: string
      VITE_APP_AUTH_API_PATH: string
      VITE_APP_CREDIT_HOST: string
    }
  }
}
