// includes http tests for the route /v1/admin/auth/login

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/auth/login', () => {
  const error = { error: expect.any(String) };
  let bodyRegister: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: { sessionId: number, authUserId: number };
  let bodyLogin: { email: string, password: string };

  beforeEach(() => {
    bodyRegister = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const { retval } = requestPost(bodyRegister, '/v1/admin/auth/register');
    token = retval as { sessionId: number, authUserId: number };
  });

  describe('Testing user login (status code 200)', () => {
    test('Has the correct return type and value of authUserId', () => {
      bodyLogin = { email: 'valid@gmail.com', password: 'Password12' };
      expect(requestPost(bodyLogin, '/v1/admin/auth/login')).toStrictEqual({
        retval: { sessionId: expect.any(Number), authUserId: token.authUserId },
        statusCode: 200
      });
    });

    test('Side effect: correctly updates user details after a failed login', () => {
      bodyLogin = { email: 'valid@gmail.com', password: 'Password34' };
      requestPost(bodyLogin, '/v1/admin/auth/login');
      expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: token.authUserId,
            name: 'Jane Doe',
            email: 'valid@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 1,
          }
        },
        statusCode: 200
      });
    });

    test('Side effect: correctly updates user details after successful login', () => {
      // first a failed login, then a successful login
      bodyLogin = { email: 'valid@gmail.com', password: 'Password34' };
      requestPost(bodyLogin, '/v1/admin/auth/login');
      bodyLogin = { email: 'valid@gmail.com', password: 'Password12' };
      const { retval } = requestPost(bodyLogin, '/v1/admin/auth/login');
      token = retval as { sessionId: number, authUserId: number };

      expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: token.authUserId,
            name: 'Jane Doe',
            email: 'valid@gmail.com',
            numSuccessfulLogins: 2,
            numFailedPasswordsSinceLastLogin: 0,
          }
        },
        statusCode: 200
      });
    });
  });

  describe('Testing email given to adminAuthLogin (status code 400)', () => {
    test('Returns error when email address does not exist', () => {
      bodyLogin = { email: 'valid1@gmail.com', password: 'Password12' };
      expect(requestPost(bodyLogin, '/v1/admin/auth/login')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });

  describe('Testing password given to adminAuthRegister (status code 400)', () => {
    test('Returns error when password does not match given email', () => {
      bodyLogin = { email: 'valid@gmail.com', password: 'Password34' };
      expect(requestPost(bodyLogin, '/v1/admin/auth/login')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });
});
