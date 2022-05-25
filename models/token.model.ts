import { Account, Model, types } from "../deps.ts";

enum Err {
  ERR_NOT_AUTHORIZED = 1001,
}

export class TokenModel extends Model {
  name: string = "token";

  static Err = Err;
  static ASSET_ID = "token";
  static CFG_DECIMALS = 4;
  static CFG_NAME = "token";
  static CFG_SYMBOL = "TOK";

  getBalance(owner: string | Account) {
    return this.callReadOnly("get-balance", [
      types.principal(typeof owner === "string" ? owner : owner.address),
    ]).result;
  }

  getDecimals() {
    return this.callReadOnly("get-decimals").result;
  }

  getName() {
    return this.callReadOnly("get-name").result;
  }

  getSymbol() {
    return this.callReadOnly("get-symbol").result;
  }

  getTokenUri() {
    return this.callReadOnly("get-token-uri").result;
  }

  getTotalSupply() {
    return this.callReadOnly("get-total-supply").result;
  }

  transfer(
    amount: number,
    sender: string | Account,
    recipient: string | Account,
    memo: undefined | string,
    txSender: string | Account
  ) {
    return this.callPublic(
      "transfer",
      [
        types.uint(amount),
        types.principal(typeof sender === "string" ? sender : sender.address),
        types.principal(
          typeof recipient === "string" ? recipient : recipient.address
        ),
        typeof memo === "undefined"
          ? types.none()
          : types.some(types.buff(memo)),
      ],
      txSender
    );
  }

  setTokenUri(uri: undefined | string, sender: string | Account) {
    return this.callPublic(
      "set-token-uri",
      [typeof uri === "undefined" ? types.none() : types.some(types.utf8(uri))],
      sender
    );
  }

  testMint(amount: number, recipient: string | Account) {
    return this.callPublic("test-mint", [
      types.uint(amount),
      types.principal(
        typeof recipient === "string" ? recipient : recipient.address
      ),
    ]);
  }
}
