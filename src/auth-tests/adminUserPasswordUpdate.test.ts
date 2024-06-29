// includes HTTP tests for the route /v1/admin/user/password

import { requestDelete, requestPut, requestPost } from '../requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('PUT /v1/admin/user/password', () => {
  const error = { error: expect.any(String) };

  let token: { sessionId: number, authUserId: number };
  let originalPassword: string;
  beforeEach(() => {
    originalPassword = 'validpa55w0rd';
    const body = { email: 'valid123@gmail.com', password: originalPassword, nameFirst: 'Jane', nameLast: 'Smith' };
    const { retval } = requestPost(body, '/v1/admin/auth/register');
    token = retval as { sessionId: number, authUserId: number };
  });

  describe('Testing for return type', () => {
    test('Has correct return type', () => {
      const changedPassword = 'password123';
      const body = { token: token.authUserId, oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: {},
        statusCode: 200
      });
    });
  });

  describe('Testing token in /v1/admin/user/password', () => {
    test('When token is not valid, from /v1/admin/auth/register', () => {
      const changedPassword = 'an0thervalid0ne';
      const body = { token: token.authUserId + 1, oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });
  });

  describe('Testing oldPassword in /v1/admin/user/password', () => {
    test('The oldPassword is not the correct oldPassword', () => {
      const incorrectOgPassword = 'validpassw0rd';
      const alteredPassword = 'newvalidpa55word';
      const body = { token: token.authUserId, oldPassword: incorrectOgPassword, newPassword: alteredPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The oldPassword and newPassword match exactly', () => {
      const matchingPassword = 'validpa55w0rd';
      const body = { token: token.authUserId, oldPassword: originalPassword, newPassword: matchingPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });

  describe('Testing newPassword in /v1/admin/user/password', () => {
    test('The newPassword has already been used before by the user', () => {
      const changedPassword = 'an0therpassw0rd';
      const alternatePassword = 'passw0rd123';

      // first password update
      const update1 = { token: token.authUserId, oldPassword: originalPassword, newPassword: changedPassword };
      requestPut(update1, '/v1/admin/user/password');

      // second password update
      const update2 = { token: token.authUserId, oldPassword: changedPassword, newPassword: alternatePassword };
      requestPut(update2, '/v1/admin/user/password');

      // update to a password that was used previously by the user
      const update3 = { token: token.authUserId, oldPassword: alternatePassword, newPassword: originalPassword };
      expect(requestPut(update3, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The newPassword is less than 8 characters', () => {
      const changedPassword = 'inva1d';
      const body = { token: token.authUserId, oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The newPassword does not contain at least one number', () => {
      const badNewPassword = 'invalidpassword';
      const body = { token: token.authUserId, oldPassword: originalPassword, newPassword: badNewPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The newPassword does not contain at least one letter', () => {
      const badNewPassword = '123456789';
      const body = { token: token.authUserId, oldPassword: originalPassword, newPassword: badNewPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The newPassword meets all criteria', () => {
      const changedPassword = 'veryvalidpassw0rd';
      const body = { token: token.authUserId, oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: {},
        statusCode: 200
      });
    });
  });

  describe('Testing side-effects from /v1/admin/user/password', () => {
    test.skip('Successful login before updating password', () => {
      const body = { email: 'valid123@gmail.com', password: originalPassword };
      expect(requestPost(body, '/v1/admin/auth/login')).toStrictEqual({
        retval: { sessionId: expect.any(Number), authUserId: token.authUserId },
        statusCode: 200
      });
    });

    test.skip('Successful login after updating password', () => {
      const body = { email: 'valid123@gmail.com', password: originalPassword };
      expect(requestPost(body, '/v1/admin/auth/login')).toStrictEqual({
        retval: { sessionId: expect.any(Number), authUserId: token.authUserId },
        statusCode: 200
      });

      const alteredPassword = 'newpa55word';
      const newBody = { email: 'valid123@gmail.com', oldPassword: originalPassword, newPassword: alteredPassword };
      requestPut(newBody, '/v1/admin/user/password');
      expect(requestPost({ email: 'valid123@gmail.com', password: alteredPassword }, '/v1/admin/auth/login')).toStrictEqual({
        retval: { senssionId: expect.any(Number), authUserId: token.authUserId },
        statusCode: 200
      });
    });
  });
});
