import { StringColumn, NumberColumn } from "./column"

export type ColumnToPrimitive<TColumn> = TColumn extends StringColumn
  ? string
  : TColumn extends NumberColumn
  ? number
  : any

export function escapeSql(input: any){
  if(typeof input === "string")
    return "'" + input + "'"
  return input
}

export type SubType<Base, Condition> = Pick<Base, {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never
}[keyof Base]>;
