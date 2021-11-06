import {
  assertEquals,
  beforeEach,
  Chain,
  describe,
  it,
  run,
  types,
} from "../deps.ts";
import { TokenModel } from "../models/token.model.ts";
import { Context } from "../src/context.ts";

let ctx: Context;
let chain: Chain;
let token: TokenModel;

beforeEach(() => {
  ctx = new Context();
  chain = ctx.chain;
  token = ctx.models.get(TokenModel);
});

describe("[TOKEN]", () => {
  describe("get-balance()", () => {
    it("returns 0 for owner without any tokens", () => {
      const owner = ctx.accounts.get("wallet_4")!;

      token.getBalance(owner).expectOk().expectUint(0);
    });

    it("returns correct amount for owner who owns some tokens", () => {
      const owner = ctx.accounts.get("wallet_3")!;
      const amount = 2000;
      chain.mineBlock([token.testMint(amount, owner)]);

      token.getBalance(owner).expectOk().expectUint(amount);
    });
  });

  describe("get-decimals()", () => {
    it(`returns ${TokenModel.CFG_DECIMALS}`, () => {
      token.getDecimals().expectOk().expectUint(TokenModel.CFG_DECIMALS);
    });
  });

  describe("get-name()", () => {
    it(`returns "${TokenModel.CFG_NAME}"`, () => {
      token.getName().expectOk().expectAscii(TokenModel.CFG_NAME);
    });
  });

  describe("get-symbol()", () => {
    it(`returns "${TokenModel.CFG_SYMBOL}"`, () => {
      token.getSymbol().expectOk().expectAscii(TokenModel.CFG_SYMBOL);
    });
  });

  describe("get-token-uri", () => {
    it("returns none by default", () => {
      token.getTokenUri().expectOk().expectNone();
    });

    it("returns correct uri when it has been set", () => {
      const uri = "http://blabla.com/bleble/blublu";
      chain.mineBlock([token.setTokenUri(uri, ctx.deployer)]);

      token.getTokenUri().expectOk().expectSome().expectUtf8(uri);
    });
  });

  describe("get-total-supply()", () => {
    it("returns 0 by default", () => {
      const amount = 0;
      token.getTotalSupply().expectOk().expectUint(amount);
    });

    it("returns 100 after 100 tokens gets minted", () => {
      const amount = 100;
      chain.mineBlock([token.testMint(amount, ctx.deployer)]);

      token.getTotalSupply().expectOk().expectUint(amount);
    });
  });

  describe("transfer()", () => {
    it("fails when sender is different than tx-sender", () => {
      const amount = 10;
      const sender = ctx.accounts.get("wallet_1")!;
      const recipient = ctx.accounts.get("wallet_2")!;
      const memo = undefined;
      const txSender = ctx.deployer;

      const receipt = chain.mineBlock([
        token.transfer(amount, sender, recipient, memo, txSender),
      ]).receipts[0];

      receipt.result.expectErr().expectUint(TokenModel.Err.ERR_NOT_AUTHORIZED);
    });

    it("succeeds and transfers tokens to recipient", () => {
      const amount = 10;
      const sender = ctx.accounts.get("wallet_5")!;
      const recipient = ctx.accounts.get("wallet_4")!;
      const memo = undefined;
      const txSender = sender;
      chain.mineBlock([token.testMint(amount, sender)]);

      const receipt = chain.mineBlock([
        token.transfer(amount, sender, recipient, memo, txSender),
      ]).receipts[0];

      receipt.result.expectOk().expectBool(true);

      assertEquals(receipt.events.length, 1);
      receipt.events.expectFungibleTokenTransferEvent(
        amount,
        sender.address,
        recipient.address,
        TokenModel.ASSET_ID
      );
    });

    it("succeeds, transfers tokens to recipient and prints supplied memo", () => {
      const amount = 123213;
      const sender = ctx.accounts.get("wallet_3")!;
      const recipient = ctx.accounts.get("wallet_1")!;
      const memo = "hello world";
      const txSender = sender;
      chain.mineBlock([token.testMint(amount, sender)]);

      const receipt = chain.mineBlock([
        token.transfer(amount, sender, recipient, memo, txSender),
      ]).receipts[0];

      receipt.result.expectOk().expectBool(true);

      assertEquals(receipt.events.length, 2);
      receipt.events.expectFungibleTokenTransferEvent(
        amount,
        sender.address,
        recipient.address,
        TokenModel.ASSET_ID
      );

      receipt.events.expectPrintEvent(token.address, types.buff(memo));
    });
  });

  describe("set-token-uri()", () => {
    it("fails if not called by contract deployer", () => {
      const uri = "http://abcdef.com";
      const sender = ctx.accounts.get("wallet_3")!;

      const receipt = chain.mineBlock([token.setTokenUri(uri, sender)])
        .receipts[0];

      receipt.result.expectErr().expectUint(TokenModel.Err.ERR_NOT_AUTHORIZED);
    });

    it("succeeds and sets desired uri", () => {
      const uri = "http://qwerty.com";
      const sender = ctx.deployer;

      const receipt = chain.mineBlock([token.setTokenUri(uri, sender)])
        .receipts[0];

      receipt.result.expectOk().expectBool(true);

      token.getTokenUri().expectOk().expectSome().expectUtf8(uri);
    });

    it("succeeds and clears uri", () => {
      const oldUri = "http://qwerty.com";
      const newUri = undefined;
      const sender = ctx.deployer;
      chain.mineBlock([token.setTokenUri(oldUri, sender)]);

      const receipt = chain.mineBlock([token.setTokenUri(newUri, sender)])
        .receipts[0];

      receipt.result.expectOk().expectBool(true);

      token.getTokenUri().expectOk().expectNone();
    });
  });
});

run();
