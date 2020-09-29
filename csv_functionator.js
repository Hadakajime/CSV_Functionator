#!/usr/bin/env node

`use strict`;

//Translate a number to it's corresponding Excel column letter(s).
function asciiToExcelColumn(number) {
	let column = ``;
	while (number > 0) {
		const modulus = number % 26;
		column = String.fromCharCode(64 + modulus) + column;
		number = (number - modulus) / 26;
	}
	return column;
}

//Main
//Set up arguments
const yargs = require(`yargs`)
	.usage(`Usage: $0 [options]`)
	.option(`p`, {
		alias: `path`,
		demandOption: false,
		default: `.`,
		describe: `Input directory. Where to search for files. Defaults to the current working directory.`,
		type: `string`
	})
	.option(`i`, {
		alias: `ifile`,
		demandOption: false,
		default: `input.csv`,
		describe: `Input file name.`,
		type: `string`
	})
	.option(`o`, {
		alias: `ofile`,
		demandOption: false,
		default: `output.csv`,
		describe: `Output file name.`,
		type: `string`
	})
	.option(`d`, {
		alias: `delim`,
		demandOption: false,
		default: ``,
		describe: `Delimiter for spreadsheet contents. If omitted, this will be auto-determined in the following order: comma, tab, pipe, semicolon, tilde.`,
		type: `string`
	})
	.help(`?`)
	.alias(`?`, `help`)
	.argv;
//Avoid conflict to preserve data
if (yargs.i == yargs.o) {
	console.log(`Input and output file names are the same. Let's not do that, please.`);
	process.exit();
}
//Set up file system dependencies
const fileSystem = require(`fs`);
const inputFilePath = `${yargs.p}/${yargs.i}`;
const outputFilePath = `${yargs.p}/${yargs.o}`;
var inputFile;
var inputFileData;
var outputFile;
try {
	fileSystem.accessSync(inputFilePath, fileSystem.constants.R_OK)
	inputFile = fileSystem.openSync(`${yargs.p}/${yargs.i}`, fileSystem.constants.O_RDONLY);
	inputFileData = fileSystem.readFileSync(inputFile, `utf8`).replace(/^\uFEFF/, ``).replace(/ /g, ``);
	outputFile = fileSystem.openSync(outputFilePath, fileSystem.constants.O_CREAT | fileSystem.constants.O_WRONLY);
	fileSystem.ftruncateSync(outputFile, 0);
} catch (error) {
	console.log(`Errors occurred during input/output file access.`);
	console.log(error.message);
	process.exit();
}
//Determine header characteristics
const headerLine = inputFileData.split(/\r?\n/, 1)[0];
var delim = yargs.d;
if (delim == ``) {
	//Default delimiter in the following order: comma, tab, pipe, semicolon, tilde
	for (const search of [`,`, `\t`, `\|`, `;`, `~`]) {
		if (RegExp(`\\${search}`).test(headerLine)) {
			delim = search;
			break;
		}
	}
	if (delim == ``) {
		console.log(`Delimiter not provided and could not be determined from header row.`);
		process.exit();
	}
}
console.log(`Delimiter selected: "${delim}"`);
//We can catch invalid numbers here if we want? Or we can let them go to produce a NaNny state. Might be more useful to see effects of bad data.
//if (RegExp(`[^0-9.${delim}]`).test(headerLine)) {
//	console.log(`Invalid characters encountered in header row. These values should only be numeric.`);
//	process.exit();
//}
//Extract our base values to a reusable source
var baseNumbers = {};
var i = 0;
for (const num of headerLine.split(delim)) {
	baseNumbers[asciiToExcelColumn(++i)] = Number(num);
}
//Functionate
fileSystem.writeFileSync(outputFile, headerLine);
var resultLines = ``;
for (const line of inputFileData.split(/\r?\n/).slice(1)) {
	let resultLine = ``;
	for (const formula of line.split(delim)) {
		//Implant base numbers and evaluate. A check is performed to verify the formula is safe to run. Only math operators, column letters, and numbers are allowed.
		try {
			resultLine += (RegExp(/[^A-Z0-9+\-/*.%()]|\(\)/).test(formula)) ? `${delim}NaN` : `${delim}${eval(formula.replace(/\b(?=[A-Z])/g, `baseNumbers.`))}`;
		} catch {
			resultLine += `${delim}NaN`;
		}
	}
	resultLines += `\n${resultLine.slice(1)}`;
}
//Output and close session
fileSystem.appendFileSync(outputFile, resultLines);
fileSystem.closeSync(inputFile);
fileSystem.closeSync(outputFile);
console.log(`Functionation complete.`);
return 0;