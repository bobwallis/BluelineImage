import puppeteerCore from 'puppeteer-core'

var puppeteerLocal;

try {
  puppeteerLocal = require( 'puppeteer' );
} catch (e) {
  console.log( 'local puppeteer is missing' );
}

export const getPuppeteer = function() { return puppeteerLocal || puppeteerCore; };
