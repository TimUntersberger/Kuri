import * as psql from "./psql"

const buildFunctions = {
  psql
}

export type Driver = "psql"

export let driver: Driver | null = null

export function setDriverType(value: Driver){
  driver = value;
}

export function getDriver(){
  return buildFunctions[driver];
}
