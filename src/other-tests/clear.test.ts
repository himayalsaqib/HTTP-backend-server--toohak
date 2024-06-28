import { requestDelete } from '../requestHelper';

describe('DELETE /v1/clear', () => {
  describe('Test for the return type of clear', () => {
    test('Has correct return type', () => {
      const res = requestDelete('/v1/clear');
      expect(res.retval).toStrictEqual({});
      expect(res.statusCode).toStrictEqual(200);
    });
  });

  describe('Testing side-effects of clear', () => {
    let user;
    beforeEach(() => {
      user = adminAuthRegister('email@gmail.com', 'password123', 'Jane', 'Doe');
    });

    test('Successful registration of user', () => {
      expect(user).toStrictEqual({ authUserId: user.authUserId });
    });

    test('Successful access of user details in adminUserDetails after logging in once', () => {
      const newUser = adminAuthRegister('valid@gmail.com', 'validpa55word', 'John', 'Smith');
      expect(adminAuthLogin('valid@gmail.com', 'validpa55word')).toStrictEqual({ authUserId: newUser.authUserId });

      expect(adminUserDetails(newUser.authUserId)).toStrictEqual({
        user: {
          userId: newUser.authUserId,
          name: 'John Smith',
          email: 'valid@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        }
      });
    });

    test('Error returned by adminUserDetails after calling clear', () => {
      requestDelete('/v1/clear');
      expect(adminUserDetails(user.authUserId)).toStrictEqual({ error: expect.any(String) });
    });
  });
});
