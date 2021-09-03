import {
  describe,
  beforeEach,
  it,
  run,
  assertEquals,
  Account,
} from "../deps.ts";
import { Context } from "../src/context.ts";
import { Base } from "../models/base.model.ts";

describe("[BASE]", () => {
  let ctx: Context;
  let base: Base;

  beforeEach(() => {
    ctx = new Context();
    base = ctx.models.get(Base);
  });

  describe("hello()", () => {
    it("returns 'hello world'", () => {
      base.hello("world").expectAscii("hello world");
    });
  });
});

run();
