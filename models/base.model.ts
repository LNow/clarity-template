import { Account, types } from "../deps.ts";
import { Model } from "../src/model.ts";

enum Err {
  ERR_NOT_AUTHORIZED = 1001,
}

export class Base extends Model {
  name: string = "base";

  static Err = Err;

  hello(who: string) {
    return this.callReadOnly("hello", [types.ascii(who)]).result;
  }
}
