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

    
});
