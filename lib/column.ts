import { TableColumns } from "./table"

export interface ColumnType {
  isPrimaryKey: boolean;
  isArray: boolean;
  primaryKey: () => this;
  unique: () => this;
}

export interface StringColumn extends ColumnType {
  type: "string"
}

export interface NumberColumn extends ColumnType {
  type: "number"
}

export interface ArrayColumn<TItem extends TableColumns> extends ColumnType {
  type: "array"
  findAll(): TItem[]
}

export function createArray(name: string, arg: any): any {}

export function createColumn(isUnique = false, isPrimaryKey = false): ColumnType{
  function primaryKey() {
    return createColumn(true, true)
  }

  function unique(){
    return createColumn(true)
  }

  return { 
    isPrimaryKey,
    isUnique,
    primaryKey,
    unique
  } as any;
}

export function number(): NumberColumn {
  return {
    ...createColumn(false, false)
  } as any
}

export function string(): StringColumn {
  return {
    ...createColumn(false, false)
  } as any
}
