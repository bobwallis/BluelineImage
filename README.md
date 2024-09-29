# Blueline Image Generator
This is an AWS Lambda function that generates images of bellringing methods by
taking screenshots of https://rsw.me.uk/blueline/ using a headless web browser.

## How to use
Install Node.js, and the serverless cli (`npm i -g serverless`).

Install dependencies using `npm install`.

Test using `serverless deploy`, which will give back an endpoint from which to run
that will look something like `https://[letters].execute-api.eu-west-2.amazonaws.com/dev`.

Test like this: `https://[letters].execute-api.eu-west-2.amazonaws.com/dev?url=https://rsw.me.uk/blueline/methods/view/Cambridge_Surprise_Minor&scale=2&style=numbers`

Once working, deploy using `serverless deploy --stage prod` to push to a URL like
the above but with `prod` on the end.

If you want to update the dependencies of this project then make sure that the
version of `@sparticuz/chromium` that gets installed is the right one for the
version of Puppeteer. [See the list here](https://pptr.dev/supported-browsers).
