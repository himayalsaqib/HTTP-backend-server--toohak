// includes http tests for the route /v1/admin/auth/logout and /v2/admin/auth/logout

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/auth/logout', () => {
  let bodyRegister: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;

  beforeEach(() => {
    bodyRegister = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(bodyRegister, '/v1/admin/auth/register');
    token = registerResponse.retval.token;
  });

  describe('Testing successful user logout (status code 200)', () => {
    test('Has the correct return type', () => {
      expect(requestPost({ token }, '/v1/admin/auth/logout')).toStrictEqual({
        retval: {},
        statusCode: 200
      });
    });

    test('Side effect: adminUserDetails returns error when called with a logged out token (invalid)', () => {
      expect(requestPost({ token }, '/v1/admin/auth/logout')).toStrictEqual({
        retval: {},
        statusCode: 200
      });
      expect(requestGet({ token }, '/v1/admin/user/details')).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });

  describe('Testing token given to adminAuthLogout (status code 401)', () => {
    test('Returns error when token is empty', () => {
      requestDelete({}, '/v1/clear');
      expect(requestPost({ token }, '/v1/admin/auth/logout')).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Returns error when sessionId is not a valid logged in user session', () => {
      const sessionId = (parseInt(token) + 1).toString();
      expect(requestPost({ token: sessionId }, '/v1/admin/auth/logout')).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Side effect: adminAuthLogout returns error when user tries to logout same token twice', () => {
      expect(requestPost({ token }, '/v1/admin/auth/logout')).toStrictEqual({
        retval: {},
        statusCode: 200
      });
      expect(requestPost({ token }, '/v1/admin/auth/logout')).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });
});

describe('POST /v2/admin/auth/logout', () => {
  let bodyRegister: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;

  beforeEach(() => {
    bodyRegister = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(bodyRegister, '/v1/admin/auth/register');
    token = registerResponse.retval.token;
  });

  describe('Testing successful user logout (status code 200)', () => {
    test('Has the correct return type', () => {
      expect(requestPost({}, '/v2/admin/auth/logout', { token })).toStrictEqual({
        retval: {},
        statusCode: 200
      });
    });

    test('Side effect: adminUserDetails returns error when called with a logged out token (invalid)', () => {
      expect(requestPost({}, '/v2/admin/auth/logout', { token })).toStrictEqual({
        retval: {},
        statusCode: 200
      });
      expect(requestGet({}, '/v2/admin/user/details', { token })).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });

  describe('Testing token given to adminAuthLogout (status code 401)', () => {
    test('Returns error when token is empty', () => {
      requestDelete({}, '/v1/clear');
      expect(requestPost({}, '/v2/admin/auth/logout', { token })).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Returns error when sessionId is not a valid logged in user session', () => {
      const sessionId = (parseInt(token) + 1).toString();
      expect(requestPost({}, '/v2/admin/auth/logout', { token: sessionId })).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Side effect: adminAuthLogout returns error when user tries to logout same token twice', () => {
      expect(requestPost({}, '/v2/admin/auth/logout', { token })).toStrictEqual({
        retval: {},
        statusCode: 200
      });
      expect(requestPost({}, '/v2/admin/auth/logout', { token })).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });
});
