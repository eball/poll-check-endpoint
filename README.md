# Poll Endpoint GitHub Action

This action polls a specified HTTP or HTTPS endpoint until it responds with the expected status code or the timeout is exceeded.

This action can be particularly useful to check the status of a container launched with the `-d` flag as part of a CI workflow.

## Inputs

### `url`

**Required** The URL to poll.

### `method`

**Optional** The HTTP method to use. Default `"GET"`.

### `expectStatus`

**Optional** The HTTP status that is expected. Default `"200"`.

### `expectBody`

**Optional** Response body that is expected.

### `expectBodyRegex`

**Optional** Regex to match expected response body

### `failedBody`

**Optional** Failed result in response body

### `failedBodyRegex`

**Optional** Regex to match failed result in response body

### `timeout`

**Optional** The maximum time the polling is allowed to run for (in milliseconds). Default `"60000"`.

### `interval`

**Optional** The interval at which the polling should happen (in milliseconds). Default `"1000"`.

### `customHeaders`

**Optional** Additional header values as JSON string, keys in this object overwrite default headers like Content-Type.

### `data`

**Optional** Request body


## Example usage

```yml
uses: eball/poll-check-endpoint@v0.1.0
with:
  url: http://localhost:8080
  method: GET
  expectStatus: 200
  expectBodyRegex: "\"revision\":\"1\.00\""
  timeout: 60000
  interval: 1000
```
