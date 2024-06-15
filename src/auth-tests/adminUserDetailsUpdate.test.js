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

    
});
