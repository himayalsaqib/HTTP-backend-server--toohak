// includes http tests for the route /v1/admin/auth/register

import { requestDelete, requestGet, requestPost } from '../requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/auth/register', () => {
  const error = { error: expect.any(String) };
  let body: { email: string, password: string, nameFirst: string, nameLast: string };

  describe('Testing for return type (status code 200)', () => {
    test('Has the correct return type', () => {
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: { sessionId: expect.any(Number), authUserId: expect.any(Number) },
        statusCode: 200
      });
    });
  });

  describe('Testing successful registration', () => {
    let token: { sessionId: number, authUserId: number };
    beforeEach(() => {
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(body, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
    });

    test.skip('Has successful side effect (userDetails returns correct details)', () => {
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

    test.skip.each([
      { param: 'password', password: 'Password12', nameFirst: 'John', nameLast: 'Day' },
      { param: 'firstname', password: 'Password34', nameFirst: 'Jane', nameLast: 'Day' },
      { param: 'lastname', password: 'Password34', nameFirst: 'John', nameLast: 'Doe' },
    ])('Can register users with the same $param', ({ param, password, nameFirst, nameLast }) => {
      // new user with some parameter the same compared to exisiting user
      body = { email: 'valid2@gmail.com', password, nameFirst, nameLast };
      const { retval } = requestPost(body, '/v1/admin/auth/register');
      const token2 = retval as { sessionId: number, authUserId: number };

      expect(token2).toStrictEqual({ sessionId: expect.any(Number), authUserId: expect.any(Number) });
      expect(token.authUserId).not.toStrictEqual(token2.authUserId);
    });
  });

  describe('Testing email given to adminAuthRegister (status code 400)', () => {
    test('Returns error when email address used by another user', () => {
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      requestPost(body, '/v1/admin/auth/register');

      // user registering with the same email
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'John', nameLast: 'Doe' };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when email address does not meet requirements', () => {
      body = { email: 'invalid', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });

  describe('Testing password given to adminAuthRegister (status code 400)', () => {
    test('Returns error when password does not contain at least one number', () => {
      body = { email: 'valid@gmail.com', password: 'Password', nameFirst: 'Jane', nameLast: 'Doe' };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when password does not contain at least one letter', () => {
      body = { email: 'valid@gmail.com', password: '12345678', nameFirst: 'Jane', nameLast: 'Doe' };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when password is less than 8 characters', () => {
      body = { email: 'valid@gmail.com', password: 'invalid', nameFirst: 'Jane', nameLast: 'Doe' };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });

  describe('Testing nameFirst given to adminAuthregister (status code 400)', () => {
    test('Returns error when first name contains a number', () => {
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane1', nameLast: 'Doe' };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when first name contains invalid special characters', () => {
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: '@Jane', nameLast: 'Doe' };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when first name is less than 2 characters', () => {
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: '', nameLast: 'Doe' };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when first name is greater than 20 characters', () => {
      body = {
        email: 'valid@gmail.com',
        password: 'Password12',
        nameFirst: 'JaneJaneJaneJaneJaneJaneJane',
        nameLast: 'Doe'
      };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });

  describe('Testing nameLast given to adminAuthRegister (status code 400)', () => {
    test('Returns error when last name contains a number', () => {
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe1' };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when last name contains invalid special characters', () => {
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe!' };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when last name is less than 2 characters', () => {
      body = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: '' };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Returns error when last name is greater than 20 characters', () => {
      body = {
        email: 'valid@gmail.com',
        password: 'Password12',
        nameFirst: 'Jane',
        nameLast: 'DoeDoeDoeDoeDoeDoeDoe'
      };
      expect(requestPost(body, '/v1/admin/auth/register')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });
});
