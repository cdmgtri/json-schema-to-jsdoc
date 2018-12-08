
const fs = require("fs-extra");
const chalk = require("chalk");
const minimist = require("minimist") ;
const JSONSchema_JSDoc = require("./index");

module.exports = cli;

function cli() {

  const args = minimist(process.argv.slice(2));

  let inputPath = args._[0];
  let outputPath = args._[1];

  if (!inputPath) {
    console.log( chalk.red("An input path and an output path are required.") );
    process.exit(1);
  }
  else if (!outputPath) {
    console.log( chalk.red("An output path is required.") );
    process.exit(1);
  }
  else if (! fs.existsSync(inputPath)) {
    console.log( chalk.red("The given JSON schema path was not valid:", inputPath) );
    process.exit(1);
  }

  JSONSchema_JSDoc.generateFile(inputPath, outputPath);
  console.log( chalk.blue("Converted JSON schema to JSDoc file:", outputPath) );

}