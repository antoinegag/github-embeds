/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GithubFile } from "../src/GithubFile";
import { throws } from "assert";
import { readFileSync } from "fs";

const urlWithLines = "https://github.com/antoinegag/Sara/blob/master/backend/arduino/serial.js#L58-L69";
const urlOneLine = "https://github.com/antoinegag/Sara/blob/master/backend/arduino/serial.js#L58";
const urlNoLines = "https://github.com/antoinegag/Sara/blob/master/backend/arduino/serial.js";
const invalidUrl = "https://github.com/antoinegag/Sara/";
const licenseUrl = "https://github.com/antoinegag/github-embeds/blob/d180773aff5b9acfb68121ba8b4139aa7bf7a8b9/LICENSE";

let fileWithLines: GithubFile;
let fileOneLine: GithubFile;
let fileNoLines: GithubFile;
let licenseFile: GithubFile;
let licenseContent: string;

beforeAll(() => {
  fileWithLines = new GithubFile(urlWithLines);
  fileOneLine = new GithubFile(urlOneLine);
  fileNoLines = new GithubFile(urlNoLines);
  licenseFile = new GithubFile(licenseUrl);

  licenseContent = readFileSync("__tests__/LICENSE.dummy", "utf8").toString();
});

it("must parse username correctly", () => {
  expect(fileWithLines.username).toBe("antoinegag");
  expect(fileOneLine.username).toBe("antoinegag");
  expect(fileNoLines.username).toBe("antoinegag");
});

it("must parse repository correctly", () => {
  expect(fileWithLines.repository).toBe("Sara");
  expect(fileOneLine.repository).toBe("Sara");
  expect(fileNoLines.repository).toBe("Sara");
});

it("must parse the file name correctly", () => {
  expect(fileWithLines.name).toBe("serial.js");
  expect(fileOneLine.name).toBe("serial.js");
  expect(fileNoLines.name).toBe("serial.js");
});

it("must parse the line range correctly", () => {
  expect(fileWithLines.lineRange).toEqual({ start: 58, end: 69 });
  expect(fileOneLine.lineRange).toEqual({ start: 58, end: 58 });
  expect(fileNoLines.lineRange).toEqual({ start: 0, end: fileNoLines.PREVIEW_MAX_LINES });
});

it("must parse the extension correctly", () => {
  expect(fileWithLines.extension).toBe("js");
  expect(licenseFile.extension).toBeUndefined();
});

it("must generate a valid raw URL", () => {
  expect(licenseFile.getRawURL()).toBe(
    "https://raw.githubusercontent.com/antoinegag/github-embeds/d180773aff5b9acfb68121ba8b4139aa7bf7a8b9/LICENSE",
  );
  expect(fileWithLines.getRawURL()).toBe(
    "https://raw.githubusercontent.com/antoinegag/Sara/master/backend/arduino/serial.js",
  );
});

it("must retrieve content", async () => {
  expect(await licenseFile.getFileContent()).toBe(licenseContent);
});

it("must fail at invalid url", () => {
  throws(() => {
    new GithubFile(invalidUrl);
  });
});
