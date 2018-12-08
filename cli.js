
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
  }
  else if (!outputPath) {
    console.log( chalk.red("An output path is required.") );
  }

  JSONSchema_JSDoc.generateFile(inputPath, outputPath);
  console.log( chalk.blue("Converted JSON schema to JSDoc file:", outputPath) );

}