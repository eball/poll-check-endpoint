import * as core from "@actions/core";
import * as http from "@actions/http-client";

const SUPPORTED_METHODS = ["GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"];

function getInput(name: string, required = false): string {
  return core.getInput(name, { required, trimWhitespace: true });
}

function getInputNumber(name: string, defaultValue = 0): number {
  const input = core.getInput(name, { required: false, trimWhitespace: true });
  if (input === "" || isNaN(+input)) {
    return defaultValue;
  }
  return +input;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  try {
    const url = getInput("url", true);
    const method = getInput("method")?.toUpperCase() || "GET";
    const failedBody = getInput("failedBody");
    const failedBodyRe = getInput("failedBodyRegex");
    const expectBody = getInput("expectBody");
    const expectBodyRe = getInput("expectBodyRegex");
    const expectStatus = getInputNumber("expectStatus", 200);
    const timeout = getInputNumber("timeout", 60000);
    const interval = getInputNumber("interval", 1000);
    const customHeaders = getInput("customHeaders");
    const data = getInput("data");

    if (!SUPPORTED_METHODS.includes(method)) {
      core.setFailed("Specify a valid HTTP method.");
      return;
    }

    const client = new http.HttpClient();
    const startTime = Date.now();
    const bodyRegex = expectBodyRe && new RegExp(expectBodyRe);
    const failedBodyRegex = failedBodyRe && new RegExp(failedBodyRe);

    let error: Error | undefined;
    let headers = {}
    if (customHeaders) {
      try {
        headers = JSON.parse(customHeaders);
      } catch(error) {
        core.debug(`Invalid customHeaders string: ${customHeaders}`)
        core.error(`Could not parse customHeaders string value: ${error}`)
      }
    }

    while (Date.now() - startTime < timeout) {
      try {
        const response = await client.request(method, url, data, headers);
        const status = response.message.statusCode;
        core.info(`${response}`);

        if (status === expectStatus) {
          const body = await response.readBody();

          if (failedBody && failedBody === body ) {
            core.setOutput("response", body);
            core.setFailed(`Got failed response`);
            return
          }

          if (failedBodyRegex && failedBodyRegex.test(body) ) {
            core.setOutput("response", body);
            core.setFailed(`Got failed response`);
            return
          }

          if (expectBody && expectBody !== body) {
            throw new Error(`Expected body: ${expectBody}, actual body: ${body}`);
          }
          if (bodyRegex && !bodyRegex.test(body)) {
            throw new Error(`Expected body regex: ${expectBodyRe}, actual body: ${body}`);
          }

          core.setOutput("response", body);
          core.setOutput("headers", response.message.rawHeaders);

          return;
        }
        core.info(`status: ${status}`)
      } catch (e) {
        core.debug(e.message);
        error = e;
      }


      await delay(interval);
    }

    core.setFailed(error?.message || "Waiting exceeded timeout.");
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
