import { adminAuthRegister, adminUserDetails } from '../auth';
import { clear } from '../other';

beforeEach(() => {
  clear();
});

describe('adminAuthRegister', () => {
  const error = { error: expect.any(String) };

  describe('Testing for return type', () => {
    test('Has the correct return type', () => {
      const user = adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
      expect(user).toStrictEqual({ authUserId: expect.any(Number) });
    });
  });

  describe('Testing successful registration', () => {
    test('Has successful side effect (user is registered)', () => {
      const user = adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
      expect(adminUserDetails(user.authUserId)).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'Jane Doe',
          email: 'valid@gmail.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
        }
      });
    });

    test.each([
      { param: 'password', password: 'Password12', nameFirst: 'John', nameLast: 'Day' },
      { param: 'firstname', password: 'Password34', nameFirst: 'Jane', nameLast: 'Day' },
      { param: 'lastname', password: 'Password34', nameFirst: 'John', nameLast: 'Doe' },
    ])('Can register users with the same $param', ({ param, password, nameFirst, nameLast }) => {
      // user for comparison
      const user = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');

      // new user with some parameter the same
      const user2 = adminAuthRegister('valid2@gmail.com', password, nameFirst, nameLast);
      expect(user2).toStrictEqual({ authUserId: expect.any(Number) });
      expect(user.authUserId).not.toStrictEqual(user2.authUserId);
    });
  });

  describe('Testing email given to adminAuthRegister', () => {
    test('Returns error when email address used by another user', () => {
      adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
      expect(adminAuthRegister('valid@gmail.com', 'Password12', 'John', 'Doe'))
        .toStrictEqual(error);
    });

    test('Returns error when email address does not meet requirements', () => {
      expect(adminAuthRegister('invalid', 'Password12', 'Jane', 'Doe'))
        .toStrictEqual(error);
    });
  });

  describe('Testing password given to adminAuthRegister', () => {
    test('Returns error when password does not contain at least one number', () => {
      expect(adminAuthRegister('valid@gmail.com', 'Password', 'Jane', 'Doe'))
        .toStrictEqual(error);
    });

    test('Returns error when password does not contain at least one letter', () => {
      expect(adminAuthRegister('valid@gmail.com', '12345678', 'Jane', 'Doe!'))
        .toStrictEqual(error);
    });

    test('Returns error when password is less than 8 characters', () => {
      expect(adminAuthRegister('valid@gmail.com', 'invalid', 'Jane', 'Doe'))
        .toStrictEqual(error);
    });
  });

  describe('Testing nameFirst given to adminAuthregister', () => {
    test('Returns error when first name contains a number', () => {
      expect(adminAuthRegister('valid@gmail.com', 'Password12', 'Jane1', 'Doe'))
        .toStrictEqual(error);
    });

    test('Returns error when first name contains invalid special characters', () => {
      expect(adminAuthRegister('valid@gmail.com', 'Password12', '@Jane', 'Doe'))
        .toStrictEqual(error);
    });

    test('Returns error when first name is less than 2 characters', () => {
      expect(adminAuthRegister('valid@gmail.com', 'Password12', '', 'Doe'))
        .toStrictEqual(error);
    });

    test('Returns error when first name is greater than 20 characters', () => {
      expect(adminAuthRegister('valid@gmail.com', 'Password12',
        'JaneJaneJaneJaneJaneJane', 'Doe')).toStrictEqual(error);
    });
  });

  describe('Testing nameLast given to adminAuthRegister', () => {
    test('Returns error when last name contains a number', () => {
      expect(adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe1'))
        .toStrictEqual(error);
    });

    test('Returns error when last name contains invalid special characters', () => {
      expect(adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe!'))
        .toStrictEqual(error);
    });

    test('Returns error when last name is less than 2 characters', () => {
      expect(adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', ''))
        .toStrictEqual(error);
    });

    test('Returns error when last name is greater than 20 characters', () => {
      expect(adminAuthRegister('valid@gmail.com', 'Password12', 'Jane',
        'DoeDoeDoeDoeDoeDoeDoe')).toStrictEqual(error);
    });
  });
});
