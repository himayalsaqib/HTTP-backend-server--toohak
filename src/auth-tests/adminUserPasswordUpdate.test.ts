// includes HTTP tests for the route /v1/admin/user/password and
// route /v2/admin/user/password

import { requestDelete, requestPut, requestPost } from '../helper-files/requestHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('PUT /v1/admin/user/password', () => {
  let token: string;
  let originalPassword: string;
  beforeEach(() => {
    originalPassword = 'validpa55w0rd';
    const body = { email: 'valid123@gmail.com', password: originalPassword, nameFirst: 'Jane', nameLast: 'Smith' };
    const { retval } = requestPost(body, '/v1/admin/auth/register');
    token = retval.token;
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
    test('When sessionId is not valid, from /v1/admin/auth/register', () => {
      const changedPassword = 'anothervalid0ne';
      const sessionId = parseInt(token) + 1;
      const body = { token: sessionId.toString(), oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('When token is empty (no users are registered), from /v1/admin/user/password', () => {
      requestDelete({}, '/v1/clear');
      expect(requestPut({ token: token, oldPassword: 'validpa55w0rd', newPassword: 'avalidpa55word' }, '/v1/admin/user/password')).toStrictEqual({
        retval: ERROR,
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
        retval: ERROR,
        statusCode: 400
      });
    });

    test('The oldPassword and newPassword match exactly', () => {
      const matchingPassword = 'validpa55w0rd';
      const body = { token: token, oldPassword: originalPassword, newPassword: matchingPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: ERROR,
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
        retval: ERROR,
        statusCode: 400
      });
    });

    test('The newPassword is less than 8 characters', () => {
      const changedPassword = 'inva1d';
      const body = { token: token, oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('The newPassword does not contain at least one number', () => {
      const badNewPassword = 'invalidpassword';
      const body = { token: token, oldPassword: originalPassword, newPassword: badNewPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('The newPassword does not contain at least one letter', () => {
      const badNewPassword = '123456789';
      const body = { token: token, oldPassword: originalPassword, newPassword: badNewPassword };
      expect(requestPut(body, '/v1/admin/user/password')).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });
  });

  describe('Testing side-effects from /v1/admin/user/password (status code 200)', () => {
    test('Successful login after updating password', () => {
      // register new user
      const ogPassword = 'avalidpa5sw0rd';
      const body = { email: 'email@gmail.com', password: ogPassword, nameFirst: 'John', nameLast: 'Smith' };
      const res = requestPost(body, '/v1/admin/auth/register');
      expect(res).toStrictEqual({
        retval: { token: expect.any(String) },
        statusCode: 200
      });

      // login after registering
      const loginBody = { email: 'email@gmail.com', password: ogPassword };
      const loginRes = requestPost(loginBody, '/v1/admin/auth/login');
      expect(loginRes).toStrictEqual({
        retval: { token: expect.any(String) },
        statusCode: 200
      });

      // update the password
      const changedPassword = 'an0thervalidPass';
      const passwordBody = { token: res.retval.token, oldPassword: ogPassword, newPassword: changedPassword };
      const passwordRes = requestPut(passwordBody, '/v1/admin/user/password');
      expect(passwordRes).toStrictEqual({
        retval: {},
        statusCode: 200
      });

      // login with updated password
      const updatedLoginBody = { email: 'email@gmail.com', password: changedPassword };
      const updateLoginRes = requestPost(updatedLoginBody, '/v1/admin/auth/login');
      expect(updateLoginRes).toStrictEqual({
        retval: { token: expect.any(String) },
        statusCode: 200
      });
    });
  });
});

describe('PUT /v2/admin/user/password', () => {
  let token: string;
  let originalPassword: string;
  beforeEach(() => {
    originalPassword = 'validpa55w0rd';
    const body = { email: 'valid123@gmail.com', password: originalPassword, nameFirst: 'Jane', nameLast: 'Smith' };
    const { retval } = requestPost(body, '/v1/admin/auth/register');
    token = retval.token;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has correct return type', () => {
      const changedPassword = 'password123';
      const body = { oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v2/admin/user/password', { token })).toStrictEqual({
        retval: {},
        statusCode: 200
      });
    });

    test('The newPassword meets all criteria', () => {
      const changedPassword = 'veryvalidpassw0rd';
      const body = { oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v2/admin/user/password', { token })).toStrictEqual({
        retval: {},
        statusCode: 200
      });
    });
  });

  describe('Testing token in /v2/admin/user/password (status code 401)', () => {
    test('Session ID is not valid', () => {
      const changedPassword = 'anothervalid0ne';
      const sessionId = parseInt(token) + 1;
      const body = { oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v2/admin/user/password', { token: sessionId.toString() })).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('When token is empty (no users are registered), from /v2/admin/user/password', () => {
      requestDelete({}, '/v1/clear');
      expect(requestPut({ oldPassword: 'validpa55w0rd', newPassword: 'avalidpa55word' }, '/v2/admin/user/password', { token })).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });

  describe('Testing oldPassword in /v2/admin/user/password (status code 400)', () => {
    test('The oldPassword is not the correct oldPassword', () => {
      const incorrectOgPassword = 'validpassw0rd';
      const alteredPassword = 'newvalidpa55word';
      const body = { oldPassword: incorrectOgPassword, newPassword: alteredPassword };
      expect(requestPut(body, '/v2/admin/user/password', { token })).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('The oldPassword and newPassword match exactly', () => {
      const matchingPassword = 'validpa55w0rd';
      const body = { oldPassword: originalPassword, newPassword: matchingPassword };
      expect(requestPut(body, '/v2/admin/user/password', { token })).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });
  });

  describe('Testing newPassword in /v2/admin/user/password (staus code 400)', () => {
    test('The newPassword has already been used before by the user', () => {
      const changedPassword = 'an0therpassw0rd';
      const alternatePassword = 'passw0rd123';

      // first password update
      const update1 = { oldPassword: originalPassword, newPassword: changedPassword };
      requestPut(update1, '/v2/admin/user/password', { token });

      // second password update
      const update2 = { oldPassword: changedPassword, newPassword: alternatePassword };
      requestPut(update2, '/v2/admin/user/password', { token });

      // update to a password that was used previously by the user
      const update3 = { oldPassword: alternatePassword, newPassword: originalPassword };
      expect(requestPut(update3, '/v2/admin/user/password', { token })).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('The newPassword is less than 8 characters', () => {
      const changedPassword = 'inva1d';
      const body = { oldPassword: originalPassword, newPassword: changedPassword };
      expect(requestPut(body, '/v2/admin/user/password', { token })).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('The newPassword does not contain at least one number', () => {
      const badNewPassword = 'invalidpassword';
      const body = { oldPassword: originalPassword, newPassword: badNewPassword };
      expect(requestPut(body, '/v2/admin/user/password', { token })).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('The newPassword does not contain at least one letter', () => {
      const badNewPassword = '123456789';
      const body = { oldPassword: originalPassword, newPassword: badNewPassword };
      expect(requestPut(body, '/v2/admin/user/password', { token })).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });
  });

  describe('Testing side-effects from /v2/admin/user/password (status code 200)', () => {
    test('Successful login after updating password', () => {
      // register new user
      const ogPassword = 'avalidpa5sw0rd';
      const body = { email: 'email@gmail.com', password: ogPassword, nameFirst: 'John', nameLast: 'Smith' };
      const res = requestPost(body, '/v1/admin/auth/register');
      expect(res).toStrictEqual({
        retval: { token: expect.any(String) },
        statusCode: 200
      });

      // login after registering
      const loginBody = { email: 'email@gmail.com', password: ogPassword };
      const loginRes = requestPost(loginBody, '/v1/admin/auth/login');
      expect(loginRes).toStrictEqual({
        retval: { token: expect.any(String) },
        statusCode: 200
      });

      // update the password
      const changedPassword = 'an0thervalidPass';
      const passwordBody = { oldPassword: ogPassword, newPassword: changedPassword };
      const passwordRes = requestPut(passwordBody, '/v2/admin/user/password', { token: res.retval.token });
      expect(passwordRes).toStrictEqual({
        retval: {},
        statusCode: 200
      });

      // login with updated password
      const updatedLoginBody = { email: 'email@gmail.com', password: changedPassword };
      const updateLoginRes = requestPost(updatedLoginBody, '/v1/admin/auth/login');
      expect(updateLoginRes).toStrictEqual({
        retval: { token: expect.any(String) },
        statusCode: 200
      });
    });
  });
});
