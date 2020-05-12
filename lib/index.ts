import { 
  number,
  string
} from "./column"
import { table } from "./table"
import { setDriverType } from "./driver"
import { gt, lt, g } from "./condition"

const k = {
  number,
  string,
  setDriverType,
  table,
  g,
  gt,
  lt
}

k.setDriverType("psql");

const user = k.table("user", {
  id: k.number().primaryKey(),
  email: k.string().unique(),
  username: k.string(),
  password: k.string()
})

const query = user
  .findOne()

console.log(query.build().sql)
