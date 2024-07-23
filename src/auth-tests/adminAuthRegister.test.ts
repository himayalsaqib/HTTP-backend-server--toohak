// includes http tests for the route /v1/admin/auth/register

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/auth/register', () => {
  const error = { error: expect.any(String) };
  let body: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;

  beforeEach(() => {
    body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
  });

  describe('Testing successful registration (status code 200)', () => {
    beforeEach(() => {
      const response = requestPost(body, '/v1/admin/auth/register');
      token = response.retval.token;
    });

    test('Has the correct return type', () => {
      requestDelete({}, '/v1/clear');
      const registerRes = requestPost(body, '/v1/admin/auth/register');
      expect(registerRes).toStrictEqual({
        retval: { token: expect.any(String) },
        statusCode: 200
      });
      expect(parseInt(registerRes.retval.token)).toStrictEqual(expect.any(Number));
    });

    test('Side effect: adminUserDetails successfully returns registered user\'s details', () => {
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

    test.each([
      { param: 'password', password: 'Password12', nameFirst: 'John', nameLast: 'Day' },
      { param: 'firstname', password: 'Password34', nameFirst: 'Jane', nameLast: 'Day' },
      { param: 'lastname', password: 'Password34', nameFirst: 'John', nameLast: 'Doe' },
    ])('Can register users with the same $param', ({ param, password, nameFirst, nameLast }) => {
      // new user with some parameter the same compared to existing user
      body = { email: 'valid2@gmail.com', password, nameFirst, nameLast };
      const response = requestPost(body, '/v1/admin/auth/register');
      const token2 = response.retval;

      expect(token2).toStrictEqual({ token: expect.any(String) });
      expect(parseInt(token2.token)).toStrictEqual(expect.any(Number));
      expect({ token }).not.toStrictEqual(token2);
    });
  });

  describe('Testing email given to adminAuthRegister (status code 400)', () => {
    test('Returns error when email address used by another user', () => {
      requestPost(body, '/v1/admin/auth/register');

      // user registering with the same email
      body.nameFirst = 'John';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when email address does not meet requirements', () => {
      body.email = 'invalid';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });

  describe('Testing password given to adminAuthRegister (status code 400)', () => {
    test('Returns error when password does not contain at least one number', () => {
      body.password = 'Password';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when password does not contain at least one letter', () => {
      body.password = '12345678';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when password is less than 8 characters', () => {
      body.password = 'invalid';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });

  describe('Testing nameFirst given to adminAuthregister (status code 400)', () => {
    test('Returns error when first name contains a number', () => {
      body.nameFirst = 'Jane1';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when first name contains invalid special characters', () => {
      body.nameFirst = '@Jane';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when first name is less than 2 characters', () => {
      body.nameFirst = 'J';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when first name is greater than 20 characters', () => {
      body.nameFirst = 'JaneJaneJaneJaneJaneJaneJane';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });

  describe('Testing nameLast given to adminAuthRegister (status code 400)', () => {
    test('Returns error when last name contains a number', () => {
      body.nameLast = 'Doe1';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when last name contains invalid special characters', () => {
      body.nameLast = 'Doe!';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when last name is less than 2 characters', () => {
      body.nameLast = 'D';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when last name is greater than 20 characters', () => {
      body.nameLast = 'DoeDoeDoeDoeDoeDoeDoe';
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });
});
