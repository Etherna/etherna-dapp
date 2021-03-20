/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_NAME: string
    REACT_APP_TAGLINE: string
    REACT_APP_INFURA_ID: string
    REACT_APP_INDEX_HOST: string
    REACT_APP_INDEX_API_PATH: string
    REACT_APP_GATEWAY_HOST: string
    REACT_APP_GATEWAY_API_PATH: string
    REACT_APP_CREDIT_HOST: string
  }
}
