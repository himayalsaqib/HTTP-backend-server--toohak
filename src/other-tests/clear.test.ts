import { requestDelete, requestPost, requestGet } from '../requestHelper';

describe('DELETE /v1/clear', () => {
  describe('Test for the return type of clear', () => {
    test('Has correct return type', () => {
      const res = requestDelete('/v1/clear');
      expect(res.retval).toStrictEqual({});
      expect(res.statusCode).toStrictEqual(200);
    });
  });

  describe('Testing side-effects of clear', () => {
    let token: { authUserId: number };
    beforeEach(() => {
      const res = requestPost({email: 'email@gmail.com', password: 'password123', nameFirst: 'Jane', nameLast: 'Doe'}, '/v1/admin/auth/register');
      token = res.retval;
    });

    test('Successful registration of user', () => {
      expect(token).toStrictEqual({ authUserId: expect.any(Number) });
    });

    test('Successful access of user details in adminUserDetails after logging in once', () => {
      let newUserToken: { authUserId: number };
      const resRegister = requestPost({email: 'valid@gmail.com', password: 'validpa55word', nameFirst: 'John', nameLast: 'Smith'}, '/v1/admin/auth/regiser');
      newUserToken = resRegister.retval;

      expect(requestPost({ email: 'valid@gmail.com', password: 'validpa55word'}, '/v1/admin/auth/login')).toStrictEqual({ newUserToken: expect.any(Number) });

      const resDetails = requestGet({ token: newUserToken }, '/v1/admin/user/details');

      expect(resDetails.retval).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'John Smith',
          email: 'valid@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        }
      });
    });

    test('Error returned by adminUserDetails after calling clear', () => {
      requestDelete('/v1/clear');

      const resDetails = requestGet({ token }, '/v1/admin/user/details');
      expect(resDetails.statusCode).toStrictEqual(401);
    });
  });
});
