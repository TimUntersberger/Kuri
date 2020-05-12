import { ConditionBuilder } from "../condition"
import { QueryBuilderState, Query, createQuery } from "../queryBuilder"

export function buildQuery<TResult>(values: QueryBuilderState): Query<TResult> {
  let sql = "select " + values.fields.join(',') + " from " + values.tableName

  if(Object.keys(values.where).length > 0) {
    sql += " where " + Object.keys(values.where).map(key => values.where[key] instanceof ConditionBuilder
                                                    ? values.where[key].build(key)
                                                    : `${key} = ${values.where[key]}`)
                                                 .join(" and ")
  }

  if(values.amount)
    sql += " limit " + values.amount;

  return createQuery(sql)
}
