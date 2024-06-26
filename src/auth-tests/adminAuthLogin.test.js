import { adminAuthRegister, adminUserDetails, adminAuthLogin } from '../auth';
import { clear } from '../other';

beforeEach(() => {
  clear();
});

describe('adminAuthLogin', () => {
  const error = { error: expect.any(String) };

  let user;
  beforeEach(() => {
    user = adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
  });

  describe('Testing for return type', () => {
    test('Has the correct return type and value of authUserId', () => {
      const returnVal = adminAuthLogin('valid@gmail.com', 'Password12');
      expect(returnVal).toStrictEqual({ authUserId: user.authUserId });
    });
  });

  describe('Testing failed login', () => {
    test('Correctly updates user details after a failed login', () => {
      adminAuthLogin('valid@gmail.com', 'Password34');
      expect(adminUserDetails(user.authUserId)).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'Jane Doe',
          email: 'valid@gmail.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 1,
        }
      });
    });
  });

  describe('Testing successful login', () => {
    test('Correctly updates user details after successful login', () => {
      // first a failed login, then a successful login
      adminAuthLogin('valid@gmail.com', 'Password34');
      adminAuthLogin('valid@gmail.com', 'Password12');
      expect(adminUserDetails(user.authUserId)).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'Jane Doe',
          email: 'valid@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        }
      });
    });
  });

  describe('Testing email given to adminAuthLogin', () => {
    test('Returns error when email address does not exist', () => {
      expect(adminAuthLogin('valid1@gmail.com', 'Password12')).toStrictEqual(error);
    });
  });

  describe('Testing password given to adminAuthRegister', () => {
    test('Returns error when password does not match given email', () => {
      expect(adminAuthLogin('valid@gmail.com', 'Password34')).toStrictEqual(error);
    });
  });
});
