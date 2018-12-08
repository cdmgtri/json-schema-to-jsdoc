
const fs = require("fs-extra");
const RefParser = require("json-schema-ref-parser");

const JSDoc = require("../index");

let jsdocText = "";

beforeAll( async () => {
  await JSDoc.generateFile("test/sample.schema.json", "test/output/sample.js");
  jsdocText = fs.readFileSync("test/output/sample.js", {encoding: "utf8"});
});

test("Generates JSDoc for JSON schema properties", () => {

  let sample = require("./output/sample");

  expect(sample.hasOwnProperty("Person")).toBeTruthy();
  expect(sample.hasOwnProperty("Location")).toBeTruthy();
  expect(sample.hasOwnProperty("ContactCodes")).toBeTruthy();
});

test("de-referenced schema", async () => {
  let json = await RefParser.dereference("test/sample.schema.json");
  fs.outputJSONSync("test/output/sample.deref.schema.json", json, {spaces: 2});
});

test("param - required", () => {
 expect(jsdocText).toContain("* @property {string} name - A person's name");
});

test("param - optional", () => {
 expect(jsdocText).toContain("* @property {integer} [age] - A person's age");
});

test("param - object", () => {
  expect(jsdocText).toContain("@property {object} [location] - ");
});

test("param - sub-property", () => {
  expect(jsdocText).toContain("* @property {string} [location.street] - A street address");
});
