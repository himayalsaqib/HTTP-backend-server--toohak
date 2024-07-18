// includes http tests for the route GET /v1/admin/user/details and /v2/admin/user/details

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/admin/user/details', () => {
  let body: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;

  beforeEach(() => {
    body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(body, '/v1/admin/auth/register');
    token = registerResponse.retval.token;
  });

  describe('Testing for correct return type (status code 200)', () => {
    test('Successful return of user details when only one user is registered', () => {
      expect(requestGet({ token }, '/v1/admin/user/details')).toStrictEqual({
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

      expect(requestGet({ token }, '/v1/admin/user/details')).toStrictEqual({
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
      const token2 = registerResponse2.retval.token;

      expect(requestGet({ token }, '/v1/admin/user/details')).toStrictEqual({
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
      expect(requestGet({ token: token2 }, '/v1/admin/user/details')).toStrictEqual({
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
      expect(requestGet({ token }, '/v1/admin/user/details')).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Returns error when sessionId is not a valid logged in user session', () => {
      const sessionId = (parseInt(token) + 1).toString();
      expect(requestGet({ token: sessionId }, '/v1/admin/user/details')).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });
});

describe('GET /v2/admin/user/details', () => {
  let body: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;

  beforeEach(() => {
    body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(body, '/v1/admin/auth/register');
    token = registerResponse.retval.token;
  });

  describe('Testing for correct return type (status code 200)', () => {
    test('Successful return of user details when only one user is registered', () => {
      expect(requestGet({}, '/v2/admin/user/details', { token })).toStrictEqual({
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

      expect(requestGet({}, '/v2/admin/user/details', { token })).toStrictEqual({
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
      const token2 = registerResponse2.retval.token;

      expect(requestGet({}, '/v2/admin/user/details', { token })).toStrictEqual({
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
      expect(requestGet({}, '/v2/admin/user/details', { token: token2 })).toStrictEqual({
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
      expect(requestGet({}, '/v2/admin/user/details', { token })).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Returns error when sessionId is not a valid logged in user session', () => {
      const sessionId = (parseInt(token) + 1).toString();
      expect(requestGet({}, '/v2/admin/user/details', { token: sessionId })).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });
});
