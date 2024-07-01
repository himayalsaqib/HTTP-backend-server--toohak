// includes http tests for the route /v1/admin/user/details PUT

import { Tokens } from '../dataStore';
import { requestDelete, requestGet, requestPost, requestPut } from '../requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('PUT /v1/admin/user/details', () => {
  const error = { error: expect.any(String) };
  let user: { token: Tokens, email: string, nameFirst: string, nameLast: string };
  let userRegister: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: { sessionId: number, authUserId: number };

  describe('Testing status code 200 successful cases', () => {
    beforeEach(() => {
      userRegister = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(userRegister, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
      user = { token: token, email: 'newValidEmail1@gmail', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
    });

    test('Successful update has correct return type', () => {
      const res = requestPut(user, '/v1/admin/user/details');
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect (successful update): adminUserDetails returns newly updated properties', () => {
      requestPut(user, '/v1/admin/quiz');
      const res = requestGet({ token }, '/v1/admin/user/details');
      expect(res).toStrictEqual({
        retval: {
          user: {
            userId: token.authUserId,
            name: 'Not Jane Not Doe',
            email: 'newValidEmail1@gmail',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
          }
        },
        statusCode: 200
      });
    });
  });

  describe('Testing status code 400 errors', () => {
    beforeEach(() => {
      userRegister = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(userRegister, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
      user = { token: token, email: 'newValidEmail1@gmail', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
    });

    describe('Testing error returns for email', () => {
      test('Email is currently used by another user', () => {
        userRegister.email = 'newValidEmail1@gmail.com';
        requestPost(userRegister, '/v1/admin/auth/register');

        const res = requestPut(user, '/v1/admin/user/details');
        expect(res).toStrictEqual({ retval: { error }, statusCode: 400 });
      });

      test('Email is not valid', () => {
        user.email = 'notValid';
        const res = requestPut(user, '/v1/admin/user/details');
        expect(res).toStrictEqual({ retval: { error }, statusCode: 400 });
      });
    });

    describe('Testing error returns for names', () => {
      test('NameFirst contains invalid characters (not space, apostrophe or hyphen)', () => {
        user.nameFirst = 'Jane1';
        const res1 = requestPut(user, '/v1/admin/user/details');
        expect(res1).toStrictEqual({ retval: { error }, statusCode: 400 });

        user.nameFirst = 'Jane&';
        const res2 = requestPut(user, '/v1/admin/user/details');
        expect(res2).toStrictEqual({ retval: { error }, statusCode: 400 });
      });

      test('NameFirst is less than 2 characters', () => {
        user.nameFirst = 'J';
        const res = requestPut(user, '/v1/admin/user/details');
        expect(res).toStrictEqual({ retval: { error }, statusCode: 400 });
      });

      test('NameFirst is more than 20 characters', () => {
        user.nameFirst = 'JamieJamieJamieJamieJamie';
        const res = requestPut(user, '/v1/admin/user/details');
        expect(res).toStrictEqual({ retval: { error }, statusCode: 400 });
      });

      test('NameLast contains invalid characters (not space, apostrophe or hyphen)', () => {
        user.nameLast = 'Doe1';
        const res1 = requestPut(user, '/v1/admin/user/details');
        expect(res1).toStrictEqual({ retval: { error }, statusCode: 400 });

        user.nameLast = 'Doe&';
        const res2 = requestPut(user, '/v1/admin/user/details');
        expect(res2).toStrictEqual({ retval: { error }, statusCode: 400 });
      });

      test('NameLast is less than 2 characters', () => {
        user.nameLast = 'D';
        const res = requestPut(user, '/v1/admin/user/details');
        expect(res).toStrictEqual({ retval: { error }, statusCode: 400 });
      });

      test('NameLast is more than 20 characters', () => {
        user.nameLast = 'DavidDavidDavidDavidDavid';
        const res = requestPut(user, '/v1/admin/user/details');
        expect(res).toStrictEqual({ retval: { error }, statusCode: 400 });
      });
    });
  });

  describe('Testing status code 401 errors', () => {
    test('Token is empty (no users are registered)', () => {
      user = { token: token, email: 'newValidEmail1@gmail', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const res = requestPut(user, '/v1/admin/user/details');
      expect(res).toStrictEqual({ retval: { error }, statusCode: 401 });
    });

    test('AuthUserId is not valid', () => {
      userRegister = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(userRegister, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
      user = { token: token, email: 'newValidEmail1@gmail', nameFirst: 'Not Jane', nameLast: 'Not Doe' };

      user.token.authUserId += 1;
      const res = requestPut(user, '/v1/admin/user/details');
      expect(res).toStrictEqual({ retval: { error }, statusCode: 401 });
    });

    test('SessionId is not valid', () => {
      userRegister = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(userRegister, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
      user = { token: token, email: 'newValidEmail1@gmail', nameFirst: 'Not Jane', nameLast: 'Not Doe' };

      user.token.sessionId += 1;
      const res = requestPut(user, '/v1/admin/user/details');
      expect(res).toStrictEqual({ retval: { error }, statusCode: 401 });
    });
  });
});
