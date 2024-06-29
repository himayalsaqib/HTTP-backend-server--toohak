// includes HTTP tests for the route /v1/admin/user/password

import { requestDelete, requestPut, requestPost } from "../requestHelper";

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('PUT /v1/admin/user/password', () => {
  const error = { error: expect.any(String) };

  let token: { sessionId: number, authUserId: number };
  let originalPassword: string;
  beforeEach(() => {
    originalPassword = 'validpa55w0rd';
    const body = { email: 'valid123@gmail.com', password: originalPassword, nameFirst: 'Jane', nameLast: 'Smith'};
    const { retval } = requestPost(body, '/v1/admin/auth/register');
    token = retval as { sessionId: number, authUserId: number };
  });

  describe('Testing for return type', () => {
    test('Has correct return type', () => {
      const changedPassword = 'password123';
      const body = { token: token.sessionId, oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({ 
        retval: {}, 
        statusCode: 200
      });
    });
  });

  describe('Testing token in /v1/admin/user/password', () => {
    test('When token is not valid, from /v1/admin/auth/register', () => {
      const changedPassword = 'an0thervalid0ne';
      const body = { token: token.sessionId + 1, oldPassword: originalPassword, newPassword: changedPassword };
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
      const body = { token: token.sessionId, oldPassword: incorrectOgPassword, newPassword: alteredPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The oldPassword and newPassword match exactly', () => {
      const matchingPassword = 'validpa55word';
      const changedPassword = 'validpa55word';
      const body = { token: token.sessionId , oldPassword: matchingPassword, newPassword: changedPassword };
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
      adminUserPasswordUpdate(user.authUserId, originalPassword, changedPassword);

      // second password update
      adminUserPasswordUpdate(user.authUserId, changedPassword, alternatePassword);

      // update to a password that was used previously by the user
      expect(adminUserPasswordUpdate(user.authUserId, alternatePassword,
        originalPassword)).toStrictEqual(error);
    });

    test('The newPassword is less than 8 characters', () => {
      const changedPassword = 'inva1d';
      expect(adminUserPasswordUpdate(user.authUserId, originalPassword, changedPassword))
        .toStrictEqual(error);
    });

    test('The newPassword does not contain at least one number', () => {
      const badNewPassword = 'invalidpassword';
      expect(adminUserPasswordUpdate(user.authUserId, originalPassword, badNewPassword))
        .toStrictEqual(error);
    });

    test('The newPassword does not contain at least one letter', () => {
      const badNewPassword = '123456789';
      expect(adminUserPasswordUpdate(user.authUserId, originalPassword, badNewPassword))
        .toStrictEqual(error);
    });

    test('The newPassword meets all criteria', () => {
      const changedPassword = 'veryvalidpassw0rd';
      expect(adminUserPasswordUpdate(user.authUserId, originalPassword, changedPassword))
        .toStrictEqual({});
    });
  });

  describe('Testing side-effects from /v1/admin/user/password', () => {
    test('Successful login before updating password', () => {
      expect(adminAuthLogin('valid123@gmail.com', originalPassword))
        .toStrictEqual({ authUserId: user.authUserId });
    });

    test('Successful login after updating password', () => {
      expect(adminAuthLogin('valid123@gmail.com', originalPassword))
        .toStrictEqual({ authUserId: user.authUserId });

      const alteredPassword = 'newpa55word';
      adminUserPasswordUpdate(user.authUserId, originalPassword, alteredPassword);
      expect(adminAuthLogin('valid123@gmail.com', alteredPassword))
        .toStrictEqual({ authUserId: user.authUserId });
    });
  });
});
