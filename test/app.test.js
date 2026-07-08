const test = require('node:test');
const assert = require('node:assert/strict');
const { home, health } = require('../src/handlers');

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('GET / returns the demo message', () => {
  const response = createResponse();

  home({}, response);

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /AAP DevOps POC/);
  assert.match(response.body, /CI\/CD Pipeline/);
  assert.match(response.body, /Production online/);
});

test('GET /health returns OK', () => {
  const response = createResponse();

  health({}, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, 'OK');
});
