import { ColumnToPrimitive, escapeSql } from "./util"
import { ConditionBuilder } from "./condition"
import { getDriver } from "./driver"

export interface Query<TResult> {
  sql: string
  run(): Promise<TResult>
}

export function createQuery(sql: string){
  function run (){}
  
  return {
    sql,
    run
  } as any
}

export type WhereCondition<TColumn> = ColumnToPrimitive<TColumn> | ConditionBuilder
export type WhereConditions<TEntity> = {
  [p in keyof TEntity]?: WhereCondition<TEntity[p]>
}

export interface QueryBuilder<TEntity, TResult> {
  select(fields?: string[]): QueryBuilder<TEntity, TResult>;
  limit(max: number): QueryBuilder<TEntity, TResult>;
  where(conditions: WhereConditions<TEntity> | ConditionBuilder): QueryBuilder<TEntity, TResult>;
  build(): Query<TResult>;
  run(): Promise<TResult>;
}

export type QueryBuilderState<TEntity = any> = {
  tableName?: string,
  fields?: string[],
  amount?: number,
  where?: WhereConditions<TEntity> | ConditionBuilder
}

export function createQueryBuilder<TEntity, TResult>(
  tableName: string, 
  values: QueryBuilderState = {}
): QueryBuilder<TEntity, TResult> {
  values.fields = values.fields ?? ["*"];
  values.tableName = tableName;
  values.where = values.where ?? {};
  values.amount = values.amount ?? null;

  function select(newFields?: string[]){
    return createQueryBuilder(tableName, {
      ...values,
      fields: newFields?.length > 0 ? newFields.map(escapeSql) : values.fields,
    });
  }

  function limit(amount: number){
    return createQueryBuilder(tableName, {
      ...values,
      amount
    });
  }
  
  function where(conditions: WhereConditions<TEntity>){
    return createQueryBuilder(tableName, {
      ...values,
      where: conditions
    });
  }

  function run(){
    return getDriver().buildQuery(values).run();
  }

  return {
    select,
    limit,
    where,
    build: () => getDriver().buildQuery(values),
    run,
  } as any
}
