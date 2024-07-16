// includes the request helper functions for HTTP tests

import request from 'sync-request-curl';
import { port, url } from '../config.json';
import IncomingHttpHeaders from 'http';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

/**
 * Function sends a GET request to the server
 *
 * @param {object} qs
 * @param {string} path
 * @param {IncomingHttpHeaders.IncomingHttpHeaders} header
 * @returns {any}
 */
export function requestGet(qs: object, path: string, header?: IncomingHttpHeaders.IncomingHttpHeaders): any {
  const res = request(
    'GET',
    SERVER_URL + path,
    {
      qs: qs,
      headers: header,
      timeout: TIMEOUT_MS
    }
  );
  return { retval: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

/**
 * Function sends a DELETE request to the server
 *
 * @param {object} qs
 * @param {string} path
 * @param {IncomingHttpHeaders.IncomingHttpHeaders} header
 * @returns {any}
 */
export function requestDelete(qs: object, path: string, header?: IncomingHttpHeaders.IncomingHttpHeaders): any {
  const res = request(
    'DELETE',
    SERVER_URL + path,
    {
      qs: qs,
      headers: header,
      timeout: TIMEOUT_MS
    }
  );
  return { retval: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

/**
 * Function sends a PUT request to the server
 *
 * @param {object} body
 * @param {string} path
 * @param {IncomingHttpHeaders.IncomingHttpHeaders} header
 * @returns {any}
 */
export function requestPut(body: object, path: string, header?: IncomingHttpHeaders.IncomingHttpHeaders): any {
  const res = request(
    'PUT',
    SERVER_URL + path,
    {
      json: body,
      headers: header,
      timeout: TIMEOUT_MS
    }
  );
  return { retval: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

/**
 * Function sends a POST request to the server
 *
 * @param {object} body
 * @param {string} path
 * @param {IncomingHttpHeaders.IncomingHttpHeaders} header
 * @returns {any}
 */
export function requestPost(body: object, path: string, header?: IncomingHttpHeaders.IncomingHttpHeaders): any {
  const res = request(
    'POST',
    SERVER_URL + path,
    {
      json: body,
      headers: header,
      timeout: TIMEOUT_MS
    }
  );
  return { retval: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}
