// contains the tests for all functions in auth.js

import {
    adminAuthRegister,
    adminAuthLogin,
    adminUserDetails,
    adminUserDetailsUpdate,
    adminUserPasswordUpdate
} from './auth';

beforeEach(() => {
    clear();
});