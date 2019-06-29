/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as FormatHelper from "../src/FormatHelper";

it("must escape mentions", () => {
  expect(FormatHelper.escapeSpecialText("@Poke#1650")).toBe("atPoke#1650");
});

it("must escape formatting", () => {
  expect(FormatHelper.escapeSpecialText("__**~~test~~**__")).toBe("\\_\\_\\*\\*\\~\\~test\\~\\~\\*\\*\\_\\_");
});
