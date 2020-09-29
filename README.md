# CSV_Functionator


CSV Functionator
================

About
-----
This applet parses a CSV spreadsheet containing base numeric values in the header row and formulas in the data rows.

The output is saved to an output spreadsheet. It supports the following delimiters: comma, tab, pipe, semicolon and tilde (for fancy spreadsheets!).

It allows for basic integer and decimal arithmetic, and grouping numbers, eg: `+ - * / ( )`

How To Use
----------
A base value from the header row can be referenced in a data-row formula by using it's spreadsheet column letter. Eg. If cell B1 contains "A + 2" this will result in adding 2 to the base value in the header row cell A1, and storing the result in cell B1 of the output spreadsheet.

The default path is the current working directory, and the default input/output file names are "input.csv" and "output.csv". These can be overridden with their respective options.

The spreadsheet delimiter can be specified with a character(s), otherwise the program will try to default to a preset single-character delimiter. It does this by iterating through comma, tab, pipe, semicolon and tilde until a match is found in the header row.

Output is generated with the same delimiter as the input.

See the --help option for more details.

Notes
-----
* Only single input and output files are supported due to current budget. Please do not make them the same file.
* Also, backticks, OTBS and spaces are in place whilst management debates life's conundrums.
* Please do not format base numbers except for decimal points.
* Exit codes exit, just use your imagination.

Dependencies
------------
Node.js
Yargs

Usage
-----
`node csv_functionator.js --path /path/to/working/folder --ifile input.csv --ofile output.csv --delim ,`

Example
-------
Using the following command:
`node /path/to/csv_functionator.js -p /path/to/folder`

It will automatically search for input.csv:

`1,2,3

A+A,B+B,C+C`

Based off this input, it will determine to use comma as a delimiter.

Then it will calculate to output.csv

`1,2,3

2,4,6`
