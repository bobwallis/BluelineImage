const chromium = require( 'chrome-aws-lambda' );
const puppeteer = (function() {
  try {
    return require( 'puppeteer' );
  }
  catch(e) {
    return require( 'puppeteer-core' );
  }
} )();

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const { url = '', scale = 2, style = 'line' } = params;
    const container = (style === 'grid')? 'grid' : 'line';

    // Check for valid URL
    if( !url || !url.startsWith( 'https://rsw.me.uk/blueline/methods/view' ) ) {
      return {
        statusCode: 400,
        body: JSON.stringify( { message: 'Bad request' } )
      };
    }

    // Launch browser
    const browser = await puppeteer.launch( {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true
    } );

    // Navigate to page
    const page = await browser.newPage();
    page.setViewport( { width: 5000, height: 1200, deviceScaleFactor: Number( scale ) } );
    await page.goto( url, { waitUntil: 'load' } );

    // Wait for line to draw
    await page.waitForSelector( '.method .line canvas:first-child' );

    // Prepare page for the screenshot
    await page.evaluate( (container) => {
        // Remove elements not needed
        var elements = document.querySelectorAll( '#top, #search, #loading, #menu, .method header, .method .details, .sf-toolbar' );
        Array.prototype.forEach.call( elements, function( node ) {
            node.parentNode.removeChild( node );
        } );
        // Select the right container
        ['line', 'grid'].forEach( function( e ) {
            var elements = document.querySelectorAll( '.method .'+e );
            Array.prototype.forEach.call( elements, function( node ) {
                if( e == container ) {
                    node.style.display = 'block';
                }
                else {
                    node.parentNode.removeChild( node );
                }
            } );
        } );
        // Remove all margins and padding
        var sheet = window.document.styleSheets[0];
        sheet.insertRule( '* { margin: 0 !important; padding: 0 !important; }', sheet.cssRules.length);
        sheet.insertRule( '.method .line canvas, .method .grid canvas { margin: 5px 20px 0 5px !important; padding: 0 0 5px 0 !important; }', sheet.cssRules.length);
        sheet.insertRule( '.method .line canvas:first-child, .method .grid canvas:first-child { margin-right: 10px !important; }', sheet.cssRules.length);
        sheet.insertRule( '.method .line canvas:last-child, .method .grid canvas:last-child { margin-right: 0 !important; padding-right: 5px !important; }', sheet.cssRules.length);
    }, container );

    // Find the clip size
    const dimensions = await page.evaluate( (container) => {
        var outerHeight = function( el ) {
            var height = el.offsetHeight;
            var style = getComputedStyle( el );
            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
            return height;
        };
        var outerWidth = function( el ) {
            var width = el.offsetWidth;
            var style = getComputedStyle( el );

            width += parseInt(style.marginLeft) + parseInt(style.marginRight);
            return width;
        }

        var width = Array.from ( document.querySelectorAll( '.method .'+container+' canvas' ) )
            .map( function( e ) { return outerWidth(e); } )
            .reduce( function( prev, cur ) { return prev + cur; }, 0 );

        var height = outerHeight( document.querySelector( '.method .'+container+' canvas:first-child' ) );

        return { x: 0, y: 0, width: width, height: height };
    }, container );

    // Take and print screenshot, then close
    const imageBuffer = await page.screenshot( { clip: dimensions } );

    // Output
    return {
      statusCode: 200,
      body: imageBuffer.toString( 'base64' ),
      isBase64Encoded: true,
      headers: { 'Content-Type': 'image/png' }
    };
  } catch ( e ) {
    return {
      statusCode: 500,
      body: JSON.stringify( { message: 'Server error' } )
    };
  }
}
