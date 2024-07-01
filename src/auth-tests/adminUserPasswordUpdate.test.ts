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

  describe('Testing successful cases (status code 200)', () => {
    test('Has correct return type', () => {
      const changedPassword = 'password123';
      const body = { token: token, oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: {},
        statusCode: 200
      });
    });

    test('The newPassword meets all criteria', () => {
      const changedPassword = 'veryvalidpassw0rd';
      const body = { token: token, oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: {},
        statusCode: 200
      });
    });
  });

  describe('Testing token in /v1/admin/user/password (status code 401)', () => {
    test('When authUserId is not valid, from /v1/admin/auth/register', () => {
      const changedPassword = 'an0thervalid0ne';
      token.authUserId += 1;
      const body = { token: token, oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });

    test('When sessionId is not valid, from /v1/admin/auth/register', () => {
      const changedPassword = 'anothervalid0ne';
      token.sessionId += 1;
      const body = { token: token, oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });

    test('When token is empty (no users are registered), from /v1/admin/user/password', () => {
      expect(requestPut({ token, oldPassword: originalPassword, newPassword: 'avalidpa55word'}, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });
  });

  describe('Testing oldPassword in /v1/admin/user/password (status code 400)', () => {
    test('The oldPassword is not the correct oldPassword', () => {
      const incorrectOgPassword = 'validpassw0rd';
      const alteredPassword = 'newvalidpa55word';
      const body = { token: token, oldPassword: incorrectOgPassword, newPassword: alteredPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The oldPassword and newPassword match exactly', () => {
      const matchingPassword = 'validpa55w0rd';
      const body = { token: token, oldPassword: originalPassword, newPassword: matchingPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });

  describe('Testing newPassword in /v1/admin/user/password (staus code 400)', () => {
    test('The newPassword has already been used before by the user', () => {
      const changedPassword = 'an0therpassw0rd';
      const alternatePassword = 'passw0rd123';

      // first password update
      const update1 = { token: token, oldPassword: originalPassword, newPassword: changedPassword };
      requestPut(update1, '/v1/admin/user/password');

      // second password update
      const update2 = { token: token, oldPassword: changedPassword, newPassword: alternatePassword };
      requestPut(update2, '/v1/admin/user/password');

      // update to a password that was used previously by the user
      const update3 = { token: token, oldPassword: alternatePassword, newPassword: originalPassword };
      expect(requestPut(update3, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The newPassword is less than 8 characters', () => {
      const changedPassword = 'inva1d';
      const body = { token: token, oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The newPassword does not contain at least one number', () => {
      const badNewPassword = 'invalidpassword';
      const body = { token: token, oldPassword: originalPassword, newPassword: badNewPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The newPassword does not contain at least one letter', () => {
      const badNewPassword = '123456789';
      const body = { token: token, oldPassword: originalPassword, newPassword: badNewPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });

  describe('Testing side-effects from /v1/admin/user/password', () => {
    test.skip('Successful login after updating password (status code 200)', () => {
      // login before updating password
      const body = { email: 'valid123@gmail.com', password: originalPassword };
      expect(requestPost(body, '/v1/admin/auth/login')).toStrictEqual({
        retval: { sessionId: expect.any(Number), authUserId: token.authUserId },
        statusCode: 200
      });

      const alteredPassword = 'newpa55word';
      const newBody = { email: 'valid123@gmail.com', oldPassword: originalPassword, newPassword: alteredPassword };
      // update password
      requestPut(newBody, '/v1/admin/user/password');

      // login after updating password
      expect(requestPost({ email: 'valid123@gmail.com', password: alteredPassword }, '/v1/admin/auth/login')).toStrictEqual({
        retval: { senssionId: expect.any(Number), authUserId: token.authUserId },
        statusCode: 200
      });
    });
  });
});
