// includes http tests for the route /v1/admin/auth/logout

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/auth/logout', () => {
  const error = { error: expect.any(String) };
  let bodyRegister: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: { token: string };

  beforeEach(() => {
    bodyRegister = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(bodyRegister, '/v1/admin/auth/register')
    token = registerResponse.retval.token;
  });

  describe('Testing successful user logout (status code 200)', () => {
    test('Has the correct return type', () => {
      expect(requestPost({token}, '/v1/admin/auth/logout')).toStrictEqual({
        retval: {},
        statusCode: 200
      });
    });

    test('Side effect: adminUserDetails returns error when called with a logged out token (invalid)', () => {
      expect(requestPost({token}, '/v1/admin/auth/logout')).toStrictEqual({
        retval: {},
        statusCode: 200
      });
      expect(requestGet({token}, '/v1/admin/user/details')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });

    test('Side effect: adminAuthLogout returns error when user tries to logout same token twice', () => {
      expect(requestPost({token}, '/v1/admin/auth/logout')).toStrictEqual({
        retval: {},
        statusCode: 200
      });
      expect(requestPost({token}, '/v1/admin/auth/logout')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });
  });

  describe('Testing token given to adminAuthLogout (status code 401)', () => {
    test('Returns error when token is empty', () => {
      requestDelete({}, '/v1/clear');
      expect(requestPost({ token: token }, '/v1/admin/auth/logout')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });

    test('Returns error when sessionId is not a valid logged in user session', () => {
      const sessionId = parseInt(token.token) + 1;
      expect(requestPost({ token: sessionId.toString() }, '/v1/admin/auth/logout')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });
  });
});
