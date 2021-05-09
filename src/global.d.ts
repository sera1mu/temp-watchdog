/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly CONFIG_FILE: string;
  }
}