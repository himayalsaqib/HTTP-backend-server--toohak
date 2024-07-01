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
    let token: { sessionId: number, authUserId: number };
    let body: { email: string, password: string, nameFirst: string, nameLast: string };
    beforeEach(() => {
      body = { email: 'email@gmail.com', password: 'password123', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(body, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
    });

    test('Successful registration of user', () => {
      expect(token).toStrictEqual({ sessionId: expect.any(Number), authUserId: expect.any(Number) });
    });

    test.skip('Successful access of user details in adminUserDetails after logging in once', () => {
      const resRegister = requestPost({ email: 'valid@gmail.com', password: 'validpa55word', nameFirst: 'John', nameLast: 'Smith' }, '/v1/admin/auth/regiser');
      const newUserToken: { sessionId: number, authUserId: number } = resRegister.retval;

      expect(requestPost({ email: 'valid@gmail.com', password: 'validpa55word' }, '/v1/admin/auth/login')).toStrictEqual({ newUserToken: expect.any(Number) });

      const resDetails = requestGet({ token: newUserToken }, '/v1/admin/user/details');

      expect(resDetails.retval).toStrictEqual({
        user: {
          userId: token.authUserId,
          name: 'John Smith',
          email: 'valid@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        }
      });
    });

    test.skip('Error returned by adminUserDetails after calling clear', () => {
      requestDelete({}, '/v1/clear');

      const resDetails = requestGet({ token }, '/v1/admin/user/details');
      expect(resDetails.retval).toStrictEqual(error);
      expect(resDetails.statusCode).toStrictEqual(401);
    });
  });
});
