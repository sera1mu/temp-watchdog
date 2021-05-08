/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly RECORDS_DIR: string;
    readonly PIN_NUMBER: string;
  }
}