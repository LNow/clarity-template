import {
  describe,
  beforeEach,
  it,
  run,
  assertEquals,
  Account,
  Context,
  afterEach,
} from "../deps.ts";
import { Base } from "../models/base.model.ts";

let ctx: Context;
let base: Base;

beforeEach(() => {
  ctx = new Context();
  base = ctx.models.get(Base);
});

afterEach(() => {
  ctx.terminate();
});

describe("[BASE]", () => {
  describe("hello()", () => {
    it("returns 'hello world'", () => {
      base.hello("world").expectAscii("hello world");
    });
  });
});

run();
