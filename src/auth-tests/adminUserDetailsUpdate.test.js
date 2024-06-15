// contains the tests adminUserDetailsUpdate from auth.js

import {adminAuthRegister, adminUserDetails} from '../auth';
import {clear} from '../other';

beforeEach(() => {
    clear();
});

describe('adminQuizCreate', () => {
    const error = { error: expect.any(String) };
    let user;
    beforeEach(() => {
        user = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
    });

    test('Successful update has the correct return type', () => {
        expect(adminUserDetailsUpdate(user.authUserId + 1, 'valid1@gmail.com', 
        'Jane', 'Doe')).toStrictEqual({});
    });

    test('Returns error when authUserId is not a valid user', () => {
        expect(adminUserDetailsUpdate(user.authUserId + 1, 'valid1@gmail.com', 
        'Jane', 'Doe')).toStrictEqual( error );
    });

    test('Returns error when email is not valid', () => {
        expect(adminUserDetailsUpdate(user.authUserId, 'invalid1.com', 
        'Jane', 'Doe')).toStrictEqual( error );
    });

    test('Returns error when nameFirst contains invalid characters', () => {
        expect(adminUserDetailsUpdate(user.authUserId, 'valid1@gmail.com', 
        'Jane1', 'Doe')).toStrictEqual( error );
        expect(adminUserDetailsUpdate(user.authUserId, 'valid1@gmail.com', 
        'Jane&', 'Doe')).toStrictEqual( error );
    });

    test('Returns error when nameFirst is less than 2 characters', () => {
        expect(adminUserDetailsUpdate(user.authUserId, 'valid1@gmail.com', 
        'J', 'Doe')).toStrictEqual( error );
    });

    test('Returns error when nameFirst is more than 20 characters', () => {
        expect(adminUserDetailsUpdate(user.authUserId, 'valid1@gmail.com', 
        'JamieJamieJamieJamieJamie', 'Doe')).toStrictEqual( error );
    });

    test('Returns error when nameLast contains invalid characters', () => {
        expect(adminUserDetailsUpdate(user.authUserId, 'valid1@gmail.com', 
        'Jane', 'Doe1')).toStrictEqual( error );
        expect(adminUserDetailsUpdate(user.authUserId, 'valid1@gmail.com', 
        'Jane', 'Doe&')).toStrictEqual( error );
    });

    test('Returns error when nameLast is less than 2 characters', () => {
        expect(adminUserDetailsUpdate(user.authUserId, 'valid1@gmail.com', 
        'Jane', 'D')).toStrictEqual( error );
    });

    test('Returns error when nameLast is more than 20 characters', () => {
        expect(adminUserDetailsUpdate(user.authUserId, 'valid1@gmail.com', 
        'Jane', 'DavidDavidDavidDavidDavid')).toStrictEqual( error );
    });
});
