import { QueryBuilder, createQueryBuilder  } from "./queryBuilder"
import { SubType } from "./util"
import { ArrayColumn, createArray, ColumnType } from "./column"
import { getDriver } from "./driver"

export interface TableColumns {
  [key: string]: ColumnType
}

export type Table<TColumns extends TableColumns> = {
  tableName: string
  properties: TColumns
  findAll(): QueryBuilder<TColumns, TColumns[]>
  findOne(): QueryBuilder<TColumns, TColumns>
} & SubType<TColumns, ArrayColumn<TColumns>>

export function table<TColumns extends TableColumns>(tableName: string, properties?: TColumns): Table<TColumns> {
  const driver = getDriver();
  if(!driver){
    throw new Error("Driver is not defined.")
  }

  const arrayColumns = Object.keys(properties)
    .filter(key => properties[key].isArray)
    .map(key => createArray(key, properties[key]));

  function findAll(){
    return createQueryBuilder(tableName)
      .select()
  }

  function findOne(){
    return createQueryBuilder(tableName)
      .limit(1)
  }

  return {
    tableName,
    properties,
    ...arrayColumns,
    findAll,
    findOne
  } as any;
}

