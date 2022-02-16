# Blueline Image Generator
This is an AWS Lambda function that generates images of bellringing methods by
taking screenshots of https://rsw.me.uk/blueline/ using a headless web browser.

## How to use
Install Node.js, and the serverless cli (`npm i -g serverless`).

Install dependencies using `npm install`.

Test using `serverless offline start`.

Deploy using `sls deploy --stage prod` to startup a public endpoint on AWS.
