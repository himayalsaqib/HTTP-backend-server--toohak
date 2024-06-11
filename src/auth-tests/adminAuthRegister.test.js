import { adminAuthRegister } from '../auth';
import { clear } from '../other';

beforeEach(() => {
    clear();
});

describe('adminAuthRegister', () => {
    test('has the correct return type', () => {
        const user = adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
        expect(user).toStrictEqual({ authUserId: expect.any(Number) });
    });

    test('can register users with the same firstname, lastname and password', () => {
        const user1 = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
        const user2 = adminAuthRegister('valid2@gmail.com', 'Password12', 'Jane', 'Doe');
        expect(user2).toStrictEqual({ authUserId: expect.any(Number) });
        expect(user1.authUserId).not.toStrictEqual(user2.authUserId);
    })

    test('error when email address used by another user', () => {
        adminAuthRegister('valid@gmail.com', 'Password12', 'Jane', 'Doe');
        expect(adminAuthRegister('valid@gmail.com', 'Password12', 'John', 'Doe')).toStrictEqual({ error: expect.any(String) });
    });

    test('invalid email address does not meet requirements', () => {
        expect(adminAuthRegister('invalid', 'Password12', 'Jane', 'Doe')).toStrictEqual({ error: expect.any(String) });
    });

    test.each([
        {email:'valid@gmail.com', password: 'Password12', nameFirst: 'Jane1', nameLast: 'Doe'},
        {email:'valid@gmail.com', password: 'Password12', nameFirst: '@Jane', nameLast: 'Doe'},
        {email:'valid@gmail.com', password: 'Password12', nameFirst: '', nameLast: 'Doe'},
        {email:'valid@gmail.com', password: 'Password12', nameFirst: 'JaneJaneJaneJaneJaneJane', nameLast: 'Doe'},
    ]) ('first name requirements not met', ({email, password, nameFirst, nameLast}) => {
        expect(adminAuthRegister(email, password, nameFirst, nameLast)).toStrictEqual({ error: expect.any(String) });
    });

    test.each([
        {email:'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe1'},
        {email:'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe!'},
        {email:'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: ''},
        {email:'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'DoeDoeDoeDoeDoeDoeDoe'},
    ]) ('last name requirements not met', ({email, password, nameFirst, nameLast}) => {
        expect(adminAuthRegister(email, password, nameFirst, nameLast)).toStrictEqual({ error: expect.any(String) });
    });

    test.each([
        {email:'valid@gmail.com', password: 'invalid', nameFirst: 'Jane', nameLast: 'Doe'},
        {email:'valid@gmail.com', password: 'Password', nameFirst: 'Jane', nameLast: 'Doe'},
        {email:'valid@gmail.com', password: '12345678', nameFirst: 'Jane', nameLast: 'Doe'},
    ]) ('password requirements not met', ({email, password, nameFirst, nameLast}) => {
        expect(adminAuthRegister(email, password, nameFirst, nameLast)).toStrictEqual({ error: expect.any(String) });
    });
});