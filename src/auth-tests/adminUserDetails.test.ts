// includes http tests for the route /v1/admin/user/details (GET)

import { requestDelete, requestGet, requestPost } from '../requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('adminUserDetails', () => {
  const error = { error: expect.any(String) };
  let body: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: { sessionId: number, authUserId: number };

  describe('Testing for correct return type (successful return of user details)', () => {
    beforeEach(() => {
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(body, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
    });

    test('When only one user is registered', () => {
      expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: token.authUserId,
            name: 'Jane Doe',
            email: 'valid@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
          }
        },
        statusCode: 200
      });
    });

    test('When multiple users are registered', () => {
      // second registration
      body = { email: 'valid2@gmail.com', password: 'Password12', nameFirst: 'John', nameLast: 'Doe' };
      requestPost(body, '/v1/admin/auth/register');

      expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: token.authUserId,
            name: 'Jane Doe',
            email: 'valid@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
          }
        },
        statusCode: 200
      });
    });

    test('Can view multiple user details correctly', () => {
      // second registration
      body = { email: 'valid2@gmail.com', password: 'Password12', nameFirst: 'John', nameLast: 'Doe' };
      const { retval } = requestPost(body, '/v1/admin/auth/register');
      const token2 = retval as { sessionId: number, authUserId: number };

      expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: token.authUserId,
            name: 'Jane Doe',
            email: 'valid@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
          }
        },
        statusCode: 200
      });
      expect(requestGet(token2, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: token2.authUserId,
            name: 'John Doe',
            email: 'valid2@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
          }
        },
        statusCode: 200
      });
    });
  });

  describe('Testing authUserId given to adminUserDetails (status code 401)', () => {
    test('Returns error when token is empty (no users are registered)', () => {
      expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });

    test('Returns error when authUserId is not a valid user', () => {
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(body, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
      token.authUserId += 1;

      expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });

    test('Returns error when sessionId is not a valid logged in user session', () => {
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(body, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
      token.sessionId += 1;

      expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });
  });
});
