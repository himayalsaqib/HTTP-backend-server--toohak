import { adminAuthRegister, adminUserDetails } from '../auth';
import { clear } from '../other';

beforeEach(() => {
  clear();
});

describe('adminUserDetails', () => {
  const error = { error: expect.any(String) };

  describe('Testing authUserId given to adminUserDetails', () => {
    test('Returns error when no users are registered', () => {
      expect(adminUserDetails(1)).toStrictEqual(error);
    });

    test('Returns error when authUserId is not a valid user', () => {
      const user = adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
      expect(adminUserDetails(user.authUserId + 1)).toStrictEqual(error);
    });
  });

  describe('Testing successful return of user details', () => {
    let user;
    beforeEach(() => {
      user = adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
    });

    test('When only one user is registered', () => {
      expect(adminUserDetails(user.authUserId)).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'Jane Doe',
          email: 'valid@gmail.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });

    test('When multiple users are registered', () => {
      adminAuthRegister('valid1@gmail.com', 'Password12', 'John', 'Doe');
      expect(adminUserDetails(user.authUserId)).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'Jane Doe',
          email: 'valid@gmail.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });

    test('Can view multiple user details correctly', () => {
      const user1 = adminAuthRegister('valid1@gmail.com', 'Password12', 'John', 'Doe');
      expect(adminUserDetails(user.authUserId)).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'Jane Doe',
          email: 'valid@gmail.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
      expect(adminUserDetails(user1.authUserId)).toStrictEqual({
        user: {
          userId: user1.authUserId,
          name: 'John Doe',
          email: 'valid1@gmail.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });
  });
});
