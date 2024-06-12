import { adminAuthRegister, adminUserDetails } from '../auth';
import { clear } from '../other';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear();
});

describe('adminAuthRegister', () => {
    test('has the correct return type', () => {
        const user = adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
        expect(user).toStrictEqual({ authUserId: expect.any(Number) });
    });

    /*
    test('has successful side effect (user is registered)', () => {
        const user = adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
        expect(adminUserDetails(user.authUserId)).toStrictEqual({ user:
            {
              userId: user.authUserId,
              name: 'Jane Doe',
              email: 'valid@gmail.com',
              numSuccessfulLogins: 0,
              numFailedPasswordsSinceLastLogin: 0,
            }
        });
    });
    */

    test.each('can register users with the same firstname, lastname and/or password', () => {
        const user1 = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
        const user2 = adminAuthRegister('valid2@gmail.com', 'Password12', 'Jane', 'Doe');
        expect(user2).toStrictEqual({ authUserId: expect.any(Number) });
        expect(user1.authUserId).not.toStrictEqual(user2.authUserId);
    })

    test('returns error when email address used by another user', () => {
        adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
        expect(adminAuthRegister('valid@gmail.com', 'Password12', 'John', 'Doe')).
        toStrictEqual(ERROR);
    });

    test('returns error when email address does not meet requirements', () => {
        expect(adminAuthRegister('invalid', 'Password12', 'Jane', 'Doe')).
        toStrictEqual(ERROR);
    });

    describe ('returns error when first name requirements not met', () => {
        test('first name contains a number', () => {
            expect(adminAuthRegister('valid@gmail.com', 'Password12', 'Jane1', 'Doe')).
            toStrictEqual(ERROR);
        });

        test('first name contains a special character (not space, apostrophe or hyphen)', () => {
            expect(adminAuthRegister('valid@gmail.com', 'Password12', '@Jane', 'Doe')).
            toStrictEqual(ERROR);
        });

        test('first name is less than 2 characters', () => {
            expect(adminAuthRegister('valid@gmail.com', 'Password12', '', 'Doe')).
            toStrictEqual(ERROR);
        });

        test('first name is greater than 20 characters', () => {
            expect(adminAuthRegister('valid@gmail.com', 'Password12', 'JaneJaneJaneJaneJaneJane', 'Doe')).
            toStrictEqual(ERROR);
        });
    });

    describe ('returns error when last name requirements not met', () => {
        test('last name contains a number', () => {
            expect(adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe1')).
            toStrictEqual(ERROR);
        });

        test('last name contains a special character (not space, apostrophe or hyphen)', () => {
            expect(adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe!')).
            toStrictEqual(ERROR);
        });

        test('last name is less than 2 characters', () => {
            expect(adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', '')).
            toStrictEqual(ERROR);
        });

        test('last name is greater than 20 characters', () => {
            expect(adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'DoeDoeDoeDoeDoeDoeDoe')).
            toStrictEqual(ERROR);
        });
    });

    describe ('returns error when password requirements not met', () => {
        test('password does not contain at least one number', () => {
            expect(adminAuthRegister('valid@gmail.com', 'Password', 'Jane', 'Doe')).
            toStrictEqual(ERROR);
        });

        test('password does not contain at least one letter', () => {
            expect(adminAuthRegister('valid@gmail.com', '12345678', 'Jane', 'Doe!')).
            toStrictEqual(ERROR);
        });

        test('password is less than 8 characters', () => {
            expect(adminAuthRegister('valid@gmail.com', 'invalid', 'Jane', 'Doe')).
            toStrictEqual(ERROR);
        });
    });
});