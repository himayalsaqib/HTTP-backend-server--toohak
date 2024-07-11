// includes http tests for the route /v1/clear

import { requestDelete, requestPost, requestGet } from '../helper-files/requestHelper';

describe('DELETE /v1/clear', () => {
  const error = { error: expect.any(String) };

  describe('Test for the return type of clear', () => {
    test('Has correct return type', () => {
      const res = requestDelete({}, '/v1/clear');
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });
  });

  describe('Testing side-effects of clear', () => {
    let token: string;
    let body: { email: string, password: string, nameFirst: string, nameLast: string };
    beforeEach(() => {
      body = { email: 'email@gmail.com', password: 'password123', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(body, '/v1/admin/auth/register');
      token = retval.token;
    });

    test('Error returned by /v1/admin/user/details after clearing a registered user', () => {
      // test return of '/v1/admin/auth/register'
      expect(token).toStrictEqual(expect.any(String));

      // login the user again
      const loginBody = { email: 'email@gmail.com', password: 'password123' };
      expect(requestPost(loginBody, '/v1/admin/auth/login')).toStrictEqual({
        retval: { token: expect.any(String) },
        statusCode: 200
      });

      // get the details of the user
      expect(requestGet({ token }, '/v1/admin/user/details')).toStrictEqual({
        retval: {
          user: {
            userId: expect.any(Number),
            name: 'Jane Doe',
            email: 'email@gmail.com',
            numSuccessfulLogins: 2,
            numFailedPasswordsSinceLastLogin: 0,
          }
        },
        statusCode: 200
      });

      // set the dataStore back to it's initial state
      requestDelete({}, '/v1/clear');

      // call the route to give the details of the cleared user, return error
      expect(requestGet({ token }, '/v1/admin/user/details')).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });
  });
});
