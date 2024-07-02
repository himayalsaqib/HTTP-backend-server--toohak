// includes the request helper functions for HTTP tests

import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

export function requestGet(qs: object, path: string) {
  const res = request(
    'GET',
    SERVER_URL + path,
    {
      qs: qs,
      timeout: TIMEOUT_MS,
    }
  );
  return { retval: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

export function requestDelete(qs: object, path: string) {
  const res = request(
    'DELETE',
    SERVER_URL + path,
    {
      qs: qs,
      timeout: TIMEOUT_MS
    }
  );
  return { retval: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

export function requestPut(body: object, path: string) {
  const res = request(
    'PUT',
    SERVER_URL + path,
    {
      json: body,
      timeout: TIMEOUT_MS
    }
  );
  return { retval: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

export function requestPost(body: object, path: string) {
  const res = request(
    'POST',
    SERVER_URL + path,
    {
      json: body,
      timeout: TIMEOUT_MS
    }
  );
  return { retval: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}
