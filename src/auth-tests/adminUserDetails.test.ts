// includes http tests for the route /v1/admin/user/details (GET)

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/admin/user/details', () => {
  const error = { error: expect.any(String) };
  let body: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: { token: string };

  beforeEach(() => {
    body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(body, '/v1/admin/auth/register');
    token = registerResponse.retval;
  });

  describe('Testing for correct return type (status code 200)', () => {
    test('Successful return of user details when only one user is registered', () => {
      expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: expect.any(Number),
            name: `${body.nameFirst} ${body.nameLast}`,
            email: body.email,
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
          }
        },
        statusCode: 200
      });
    });

    test('Successful return of user details when multiple users are registered', () => {
      // second registration
      const body2 = { email: 'valid2@gmail.com', password: 'Password12', nameFirst: 'John', nameLast: 'Doe' };
      requestPost(body2, '/v1/admin/auth/register');

      expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: expect.any(Number),
            name: `${body.nameFirst} ${body.nameLast}`,
            email: body.email,
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
          }
        },
        statusCode: 200
      });
    });

    test('Can view multiple user details correctly', () => {
      // second registration
      const body2 = { email: 'valid2@gmail.com', password: 'Password12', nameFirst: 'John', nameLast: 'Doe' };
      const registerResponse2 = requestPost(body2, '/v1/admin/auth/register');
      const token2 = registerResponse2.retval;

      expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: expect.any(Number),
            name: `${body.nameFirst} ${body.nameLast}`,
            email: body.email,
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
          }
        },
        statusCode: 200
      });
      expect(requestGet(token2, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: expect.any(Number),
            name: `${body2.nameFirst} ${body2.nameLast}`,
            email: body2.email,
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
      requestDelete({}, '/v1/clear');
      expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });

    test('Returns error when sessionId is not a valid logged in user session', () => {
      const sessionId = parseInt(token.token) + 1;
      expect(requestGet({ token: sessionId.toString() }, '/v1/admin/user/details')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });
  });
});
