import { adminAuthRegister, adminUserDetails, adminAuthLogin } from '../auth';
import { clear } from '../other';

beforeEach(() => {
  clear();
});

describe('adminUserDetails', () => {
	const ERROR = { error: expect.any(String) };

  test('returns error when no users are registered', () => {
    expect(adminAuthLogin('valid@gmail.com', 'Password12')).toStrictEqual(ERROR);
  });

	describe('when one user is registered', () => {
		let user;
		beforeEach(() => {
			user = adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
		});

		test('returns error when email address does not exist', () => {
			expect(adminAuthLogin('valid1@gmail.com', 'Password12')).toStrictEqual(ERROR);
		});

		test('returns error when password does not match given email', () => {
			expect(adminAuthLogin('valid@gmail.com', 'Password34')).toStrictEqual(ERROR);
		});

		test('has the correct return type and value', () => {
			const returnVal = adminAuthLogin('valid@gmail.com', 'Password12');
			expect(returnVal).toStrictEqual({ authUserId: user.authUserId });
		});
		
		test('correctly updates user details after a failed login', () => {
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

		test('correctly updates user details after successful login', () => {
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
	//for when multiple users are registered

	describe('when multiple users are registered', () => {
		let user, user2;
		beforeEach(() => {
			user = adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
			user2 = adminAuthRegister('valid2@gmail.com', 'Password34', 'John', 'Day');
		});

		test('returns error when email address does not exist', () => {
			expect(adminAuthLogin('valid3@gmail.com', 'Password12')).toStrictEqual(ERROR);
		});

		test.each([
			{email: 'valid@gmail.com', password: 'Password34'},
			{email: 'valid2@gmail.com', password: 'Password12'}
		]) ('returns error when password does not match given email', (email, password) => {
			expect(adminAuthLogin(email, password)).toStrictEqual(ERROR);
		});
		
		test('correctly updates user details after a failed login', () => {
			adminAuthLogin('valid2@gmail.com', 'Password12');
			expect(adminUserDetails(user2.authUserId)).toStrictEqual({
        user: {
          userId: user2.authUserId,
          name: 'John Day',
          email: 'valid2@gmail.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 1,
        }
      });
		});

		test('correctly updates user details after successful login', () => {
			// first a failed login, then a successful login
			adminAuthLogin('valid2@gmail.com', 'Password12');
			adminAuthLogin('valid2@gmail.com', 'Password34');
			expect(adminUserDetails(user2.authUserId)).toStrictEqual({
        user: {
          userId: user2.authUserId,
          name: 'John Day',
          email: 'valid2@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        }
      });
		});
	});
});