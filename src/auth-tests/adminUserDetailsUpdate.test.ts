// includes http tests for the route /v1/admin/user/details PUT

import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('PUT /v1/admin/user/details', () => {
  let user: { token: string, email: string, nameFirst: string, nameLast: string };
  let userRegister: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;

  beforeEach(() => {
    userRegister = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const res = requestPost(userRegister, '/v1/admin/auth/register');
    token = res.retval.token;
    user = { token: token, email: 'newValid1@gmail.com', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Successful update has correct return type', () => {
      const res = requestPut(user, '/v1/admin/user/details');
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect (successful update): adminUserDetails returns newly updated properties', () => {
      requestPut(user, '/v1/admin/user/details');
      const res = requestGet({ token: token }, '/v1/admin/user/details');
      expect(res).toStrictEqual({
        retval: {
          user: {
            userId: expect.any(Number),
            name: 'Not Jane Not Doe',
            email: 'newValid1@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
          }
        },
        statusCode: 200
      });
    });
  });

  describe('Testing name and email errors (status code 400)', () => {
    describe('Testing error returns for email', () => {
      test('Email is currently used by another user', () => {
        userRegister.email = 'newValid1@gmail.com';
        requestPost(userRegister, '/v1/admin/auth/register');

        const res = requestPut(user, '/v1/admin/user/details');
        expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });

      test('Email is not valid', () => {
        user.email = 'notValid';
        const res = requestPut(user, '/v1/admin/user/details');
        expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });
    });

    describe('Testing error returns for names', () => {
      test('NameFirst contains invalid characters (not space, apostrophe or hyphen)', () => {
        user.nameFirst = 'Jane1';
        const res1 = requestPut(user, '/v1/admin/user/details');
        expect(res1).toStrictEqual({ retval: ERROR, statusCode: 400 });

        user.nameFirst = 'Jane&';
        const res2 = requestPut(user, '/v1/admin/user/details');
        expect(res2).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });

      test('NameFirst is less than 2 characters', () => {
        user.nameFirst = 'J';
        const res = requestPut(user, '/v1/admin/user/details');
        expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });

      test('NameFirst is more than 20 characters', () => {
        user.nameFirst = 'JamieJamieJamieJamieJamie';
        const res = requestPut(user, '/v1/admin/user/details');
        expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });

      test('NameLast contains invalid characters (not space, apostrophe or hyphen)', () => {
        user.nameLast = 'Doe1';
        const res1 = requestPut(user, '/v1/admin/user/details');
        expect(res1).toStrictEqual({ retval: ERROR, statusCode: 400 });

        user.nameLast = 'Doe&';
        const res2 = requestPut(user, '/v1/admin/user/details');
        expect(res2).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });

      test('NameLast is less than 2 characters', () => {
        user.nameLast = 'D';
        const res = requestPut(user, '/v1/admin/user/details');
        expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });

      test('NameLast is more than 20 characters', () => {
        user.nameLast = 'DavidDavidDavidDavidDavid';
        const res = requestPut(user, '/v1/admin/user/details');
        expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      user = { token: token, email: 'newvalidemail1@gmail', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const res = requestPut(user, '/v1/admin/user/details');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('SessionId is not valid', () => {
      userRegister = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(userRegister, '/v1/admin/auth/register');
      token = retval as string;
      user = { token: token, email: 'newValid1@gmail.com', nameFirst: 'Not Jane', nameLast: 'Not Doe' };

      const sessionId = parseInt(user.token) + 1;
      user.token = sessionId.toString();
      const res = requestPut(user, '/v1/admin/user/details');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });
});

//////////////////////////////////////////////////////////////////////////////

describe('PUT /v2/admin/user/details', () => {
  let user: { email: string, nameFirst: string, nameLast: string };
  let userRegister: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;

  beforeEach(() => {
    userRegister = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const res = requestPost(userRegister, '/v1/admin/auth/register');
    token = res.retval.token;
    user = { email: 'newValid1@gmail.com', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Successful update has correct return type', () => {
      const res = requestPut(user, '/v1/admin/user/details', { token });
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect (successful update): adminUserDetails returns newly updated properties', () => {
      requestPut(user, '/v1/admin/user/details');
      const res = requestGet({}, '/v1/admin/user/details', { token });
      expect(res).toStrictEqual({
        retval: {
          user: {
            userId: expect.any(Number),
            name: 'Not Jane Not Doe',
            email: 'newValid1@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
          }
        },
        statusCode: 200
      });
    });
  });

  describe('Testing name and email errors (status code 400)', () => {
    describe('Testing error returns for email', () => {
      test('Email is currently used by another user', () => {
        userRegister.email = 'newValid1@gmail.com';
        requestPost(userRegister, '/v1/admin/auth/register');

        const res = requestPut(user, '/v1/admin/user/details', { token });
        expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });

      test('Email is not valid', () => {
        user.email = 'notValid';
        const res = requestPut(user, '/v1/admin/user/details', { token });
        expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });
    });

    describe('Testing error returns for names', () => {
      test('NameFirst contains invalid characters (not space, apostrophe or hyphen)', () => {
        user.nameFirst = 'Jane1';
        const res1 = requestPut(user, '/v1/admin/user/details', { token });
        expect(res1).toStrictEqual({ retval: ERROR, statusCode: 400 });

        user.nameFirst = 'Jane&';
        const res2 = requestPut(user, '/v1/admin/user/details', { token });
        expect(res2).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });

      test('NameFirst is less than 2 characters', () => {
        user.nameFirst = 'J';
        const res = requestPut(user, '/v1/admin/user/details', { token });
        expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });

      test('NameFirst is more than 20 characters', () => {
        user.nameFirst = 'JamieJamieJamieJamieJamie';
        const res = requestPut(user, '/v1/admin/user/details', { token });
        expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });

      test('NameLast contains invalid characters (not space, apostrophe or hyphen)', () => {
        user.nameLast = 'Doe1';
        const res1 = requestPut(user, '/v1/admin/user/details', { token });
        expect(res1).toStrictEqual({ retval: ERROR, statusCode: 400 });

        user.nameLast = 'Doe&';
        const res2 = requestPut(user, '/v1/admin/user/details', { token });
        expect(res2).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });

      test('NameLast is less than 2 characters', () => {
        user.nameLast = 'D';
        const res = requestPut(user, '/v1/admin/user/details', { token });
        expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });

      test('NameLast is more than 20 characters', () => {
        user.nameLast = 'DavidDavidDavidDavidDavid';
        const res = requestPut(user, '/v1/admin/user/details', { token });
        expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      user = { email: 'newvalidemail1@gmail', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const res = requestPut(user, '/v1/admin/user/details', { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('SessionId is not valid', () => {
      userRegister = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(userRegister, '/v1/admin/auth/register');
      token = retval as string;
      user = { email: 'newValid1@gmail.com', nameFirst: 'Not Jane', nameLast: 'Not Doe' };

      const sessionId = parseInt(token) + 1;
      const res = requestPut(user, '/v1/admin/user/details', { token: sessionId.toString() });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });
});
