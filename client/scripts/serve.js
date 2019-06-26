/* eslint-disable */
'use strict';

const fs = require('fs');
const express = require('express');
const https = require('https');
const http = require('http');

process.env.NODE_ENV = 'production';

let sslCertificate = null
let sslCertificateKey = null

if ( process.env.SSL_CERTIFICATE_PATH && process.env.SSL_CERTIFICATE_KEY_PATH ) {
  try {
    sslCertificate = fs.readFileSync( process.env.SSL_CERTIFICATE_PATH )
    sslCertificateKey = fs.readFileSync( process.env.SSL_CERTIFICATE_KEY_PATH )
  } catch ( e ) {
    console.error( 'SSL_CERTIFICATE_PATH or SSL_CERTIFICATE_KEY_PATH could not be read.' )
  }
}

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const paths = require('../config/paths');

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appBuildHtml])) {
  process.exit(1);
}

const PORT = parseInt(process.env.PORT, 10) || 2000;

const expressOptions = {
  dotfiles  : 'ignore',
  etag      : false,
  extensions: ['html'],
  index     : 'index.html',
  maxAge    : '1d',
  redirect  : true,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}

let app = express()

app.use(express.static(paths.appBuild, expressOptions))

app.get('/*', function(req, res) {
  res.sendFile(__dirname + `${paths.appBuild}/index.html`)
})

if (!sslCertificate || !sslCertificateKey) {
  http.createServer({
    ignoreTrailingSlash: true,
  }, app).listen(PORT);
} else {
  https.createServer({
    ignoreTrailingSlash: true,
    key: sslCertificateKey,
    certificate: sslCertificate,
  }, app).listen(PORT);
}
