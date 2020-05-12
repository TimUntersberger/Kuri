import { escapeSql } from "./util"

export type Condition = any

export interface ConditionNode { 
  type: string
  clone(): ConditionNode;
  toSql(key: string): string;
}

export class ChildNode<T> implements ConditionNode {
  type: string = "child"
  public value: T

  constructor(value: T){
    this.value = escapeSql(value);
  }

  toSql(key: string){ return key }

  clone(){
    return new (this.constructor as any)(this.value);
  }
}

export class ParentNode implements ConditionNode { 
  type: string = "parent"

  nodes: ConditionNode[] = []

  toSql(key: string){ return `(${this.nodes.map(n => n.toSql(key)).join(" ")})` }

  clone(): ParentNode {
    const clone = new (this.constructor as any)();
    clone.nodes = this.nodes.map(n => n.clone());
    return clone;
  }

  addChild(child: ConditionNode){
    this.nodes.push(child);
  }
}

export class AndNode extends ChildNode<void> { 
  type = "and";
  toSql(key: string){ return "and" } 
}
export class OrNode extends ChildNode<void> { 
  type = "or";
  toSql(){ return "or" }
}
export class GreaterThanNode extends ChildNode<number> { 
  type = "greaterThan"; 
  toSql(key: string){ return `${key} > ${this.value}` } 
}
export class LowerThanNode extends ChildNode<number> { 
  type = "lowerThan";
  toSql(key: string){ return `${key} < ${this.value}` } 
}
export class EqualNode extends ChildNode<any> { 
  type = "equal"; 
  toSql(key: string){ return `${key} = ${this.value}` } 
}

export class ConditionBuilder {
  public parentNode: ParentNode = new ParentNode();

  private clone(){
    const clone = new ConditionBuilder();
    clone.parentNode = this.parentNode.clone();
    return clone;
  }

  gt(n: number){
    const clone = this.clone()
    clone.parentNode.addChild(new GreaterThanNode(n))
    return clone;
  }

  get and(){
    const clone = this.clone()
    clone.parentNode.addChild(new AndNode())
    return clone;
  }

  get or(){
    const clone = this.clone()
    clone.parentNode.addChild(new OrNode())
    return clone;
  }

  g(condition: ConditionBuilder){
    const clone = this.clone()
    clone.parentNode.addChild(condition.parentNode.clone())
    return clone;
  }

  lt(n: number){
    const clone = this.clone()
    clone.parentNode.addChild(new LowerThanNode(n))
    return clone;
  }

  eq(x: any){
    const clone = this.clone()
    clone.parentNode.addChild(new EqualNode(x))
    return clone;
  }

  build(propName: string): string {
    return this.parentNode.nodes.map(n => n.toSql(propName)).join(" ")
  }
}

export function g(condition: ConditionBuilder) {
  return new ConditionBuilder().g(condition)
}

export function lt(n: number) {
  return new ConditionBuilder().lt(n)
}

export function eq(x: string | number | boolean | Date) {
  return new ConditionBuilder().eq(x)
}

export function gt(n: number) {
  return new ConditionBuilder().gt(n)
}
