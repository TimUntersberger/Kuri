interface ColumnType {
  isPrimaryKey: boolean;
  isArray: boolean;
  primaryKey: () => this;
  unique: () => this;
}

interface StringColumn extends ColumnType {
  type: "string"
}

interface NumberColumn extends ColumnType {
  type: "number"
}

interface ArrayColumn<TItem extends TableColumns> extends ColumnType {
  type: "array"
  findAll(): TItem[]
}

interface TableColumns {
  [key: string]: ColumnType
}

interface Query<TResult> {
  sql: string
  run(): Promise<TResult>
}

function createQuery(sql: string){
  function run (){}
  
  return {
    sql,
    run
  } as any
}

type Driver = "psql"
let driver: Driver | null = null

type SubType<Base, Condition> = Pick<Base, {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never
}[keyof Base]>;

type Table<TColumns extends TableColumns> = {
  tableName: string
  properties: TColumns
  findAll(): QueryBuilder<TColumns, TColumns[]>
  findOne(): QueryBuilder<TColumns, TColumns>
} & SubType<TColumns, ArrayColumn<TColumns>>

function createArray(key: string, type: ColumnType){
}

type ColumnToPrimitive<TColumn> = TColumn extends StringColumn
  ? string
  : TColumn extends NumberColumn
  ? number
  : any;

type WhereCondition<TColumn> = ColumnToPrimitive<TColumn>
type WhereConditions<TEntity> = {
  [p in keyof TEntity]?: WhereCondition<TEntity[p]>
}

interface QueryBuilder<TEntity, TResult> {
  select(fields?: string[]): QueryBuilder<TEntity, TResult>;
  limit(max: number): QueryBuilder<TEntity, TResult>;
  where(conditions: WhereConditions<TEntity>): QueryBuilder<TEntity, TResult>;
  build(): Query<TResult>;
  run(): Promise<TResult>;
}

function escapeSql(input: any){
  if(typeof input === "string")
    return "'" + input + "'"
  return input;
}

function buildPsql<TResult>(values: QueryBuilderState): Query<TResult> {
  let sql = "select " + values.fields.join(',') + " from " + values.tableName

  if(Object.keys(values.where).length > 0){
    sql += " where " + Object
      .keys(values.where)
      .map(key => key + " = " + escapeSql(values.where[key]))
      .join(" and ")
  }

  if(values.amount)
    sql += " limit " + values.amount;

  return createQuery(sql)
}

type QueryBuilderState<TEntity = any> = {
  tableName?: string,
  fields?: string[],
  amount?: number,
  where?: WhereConditions<TEntity>
}

function createQueryBuilder<TEntity, TResult>(
  tableName: string, 
  build: (qb: QueryBuilderState) => Query<TResult>, 
  values: QueryBuilderState = {}
): QueryBuilder<TEntity, TResult> {
  values.fields = values.fields ?? ["*"];
  values.tableName = tableName;
  values.where = values.where ?? {};
  values.amount = values.amount ?? null;

  function select(newFields?: string[]){
    return createQueryBuilder(tableName, build, {
      ...values,
      fields: newFields?.length > 0 ? newFields : values.fields,
    });
  }

  function limit(amount: number){
    return createQueryBuilder(tableName, build, {
      ...values,
      amount
    });
  }
  
  function where(conditions: WhereConditions<TEntity>){
    return createQueryBuilder(tableName, build, {
      ...values,
      where: conditions
    });
  }

  function run(){
    return build(values).run();
  }

  return {
    select,
    limit,
    where,
    build: () => build(values),
    run,
  } as any
}

const buildFunctions = {
  psql: buildPsql
}

function setDriver(value: Driver){
  driver = value;
}

function table<TColumns extends TableColumns>(tableName: string, properties?: TColumns): Table<TColumns> {
  if(!driver){
    throw new Error("Driver is not defined.")
  }

  const arrayColumns = Object.keys(properties)
    .filter(key => properties[key].isArray)
    .map(key => createArray(key, properties[key]));

  const buildFunction = buildFunctions[driver]

  function findAll(){
    return createQueryBuilder(tableName, buildFunction)
      .select()
  }

  function findOne(){
    return createQueryBuilder(tableName, buildFunction)
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

function createColumn(isUnique = false, isPrimaryKey = false): ColumnType{
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

function number(): NumberColumn {
  return {
    ...createColumn(false, false)
  } as any
}

function string(): StringColumn {
  return {
    ...createColumn(false, false)
  } as any
}

setDriver("psql");

const user = table("user", {
  id: number().primaryKey(),
  email: string().unique(),
  username: string(),
  password: string()
})

const query = user
  .findOne()
  .where({
    id: 0,
    username: "tim"
  })

console.log(query.build().sql)
