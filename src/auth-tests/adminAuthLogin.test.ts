// includes http tests for the route /v1/admin/auth/login

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/auth/login', () => {
  const error = { error: expect.any(String) };
  let bodyRegister: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let bodyLogin: { email: string, password: string };

  beforeEach(() => {
    bodyRegister = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(bodyRegister, '/v1/admin/auth/register');
    token = registerResponse.retval.token;
    bodyLogin = { email: 'valid@gmail.com', password: 'Password12' };
  });

  describe('Testing user login (status code 200)', () => {
    test('Has the correct return type and value of authUserId', () => {
      expect(requestPost(bodyLogin, '/v1/admin/auth/login')).toStrictEqual({
        retval: { token: expect.any(String) },
        statusCode: 200
      });
    });

    test('User can login multiple times (have multiple tokens)', () => {
      const login1 = requestPost(bodyLogin, '/v1/admin/auth/login');
<<<<<<< HEAD
      token = login1.retval;
=======
      token = login1.retval.token
>>>>>>> 1c22ea544d7b8d8ab98933c6228016eb41eb78c6

      const login2 = requestPost(bodyLogin, '/v1/admin/auth/login');
      const token2 = login2.retval;

      expect(token2).toStrictEqual({ token: expect.any(String) });
      expect({ token }).not.toStrictEqual(token2);
    });

    test('Side effect: correctly updates user details after a failed login', () => {
      bodyLogin = { email: 'valid@gmail.com', password: 'Password34' };
      requestPost(bodyLogin, '/v1/admin/auth/login');
      expect(requestGet({ token }, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: expect.any(Number),
            name: `${bodyRegister.nameFirst} ${bodyRegister.nameLast}`,
            email: bodyRegister.email,
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
      const loginResponse = requestPost(bodyLogin, '/v1/admin/auth/login');
      token = loginResponse.retval.token;

      expect(requestGet({ token }, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: expect.any(Number),
            name: `${bodyRegister.nameFirst} ${bodyRegister.nameLast}`,
            email: bodyRegister.email,
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

  describe('Testing password given to adminAuthLogin (status code 400)', () => {
    test('Returns error when password does not match given email', () => {
      bodyLogin = { email: 'valid@gmail.com', password: 'Password34' };
      expect(requestPost(bodyLogin, '/v1/admin/auth/login')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });
});
