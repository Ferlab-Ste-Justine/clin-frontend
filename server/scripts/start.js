/* eslint-disable */
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const fs = require('fs');
const chalk = require('react-dev-utils/chalk');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const paths = require('../config/paths');
const clearConsole = require('react-dev-utils/clearConsole');

const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appIndexJs])) {
  process.exit(1);
}

console.log('\nRunning as ' + process.env.NODE_ENV + ' environment, using:');
console.log(JSON.stringify(paths));

if (isInteractive) {
  clearConsole();
}

console.log(chalk.cyan('\nStarting the proxy is not implemented...\n'));