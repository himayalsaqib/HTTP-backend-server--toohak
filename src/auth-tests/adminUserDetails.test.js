import { adminAuthRegister, adminUserDetails } from '../auth';
import { clear } from '../other';

beforeEach(() => {
  clear();
});

describe('adminUserDetails', () => {
	const ERROR = { error: expect.any(String) };

  test('returns error when no users are registered', () => {
    expect(adminUserDetails(1)).toStrictEqual(ERROR);
  });

  test('returns error when  authUserId is not a valid user', () => {
    const user = adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
    expect(adminUserDetails(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  describe('successfully returns user details', () => {
    let user;
    beforeEach(() => {
      user = adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
    });

  	test('when only one user is registered', () => {
      expect(adminUserDetails(user.authUserId)).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'Jane Doe',
          email: 'valid@gmail.com',
          numSuccessfulLogins: expect.any(number),
          numFailedPasswordsSinceLastLogin: expect.any(number),
        }
      });
    });

		test('when multiple users are registered', () => {
			const user1 = adminAuthRegister('valid1@gmail.com', 'Password12', 'John', 'Doe');
      expect(adminUserDetails(user.authUserId)).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'Jane Doe',
          email: 'valid@gmail.com',
          numSuccessfulLogins: expect.any(number),
          numFailedPasswordsSinceLastLogin: expect.any(number),
        }
      });
    });

		test('can view multiple user details correctly', () => {
			const user1 = adminAuthRegister('valid1@gmail.com', 'Password12', 'John', 'Doe');
      expect(adminUserDetails(user.authUserId)).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'Jane Doe',
          email: 'valid@gmail.com',
          numSuccessfulLogins: expect.any(number),
          numFailedPasswordsSinceLastLogin: expect.any(number),
        }
      });
			expect(adminUserDetails(user1.authUserId)).toStrictEqual({
        user: {
          userId: user1.authUserId,
          name: 'John Doe',
          email: 'valid1@gmail.com',
          numSuccessfulLogins: expect.any(number),
          numFailedPasswordsSinceLastLogin: expect.any(number),
        }
      });
    });
  });
});