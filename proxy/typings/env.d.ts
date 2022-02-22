export { }

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ETHERNA_SSO_PROJECT_PATH: string
      ETHERNA_INDEX_PROJECT_PATH: string
      ETHERNA_CREDIT_PROJECT_PATH: string
      ETHERNA_GATEWAY_PROJECT_PATH: string
      ETHERNA_BEEHIVE_PROJECT_PATH: string
      BEE_LOCAL_INSTANCE: string
      BEE_SEED_ENABLED: string
      BEE_ENDPOINT: string
      BEE_DEBUG_ENDPOINT: string
      SSL_KEY_FILE: string
      SSL_CRT_FILE: string
      NODE_TLS_REJECT_UNAUTHORIZED: string
      GATEWAY_PORT: string
      GATEWAY_PROXY_BEE_HOST: string
      GATEWAY_PROXY_BEE_DEBUG_HOST: string
      GATEWAY_PROXY_VALIDATOR_HOST: string
      DISABLE_REQUEST_VALIDATION: string
    }
  }
}
