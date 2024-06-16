import { adminUserPasswordUpdate, adminAuthRegister, adminAuthLogin } from "../auth";
import { clear } from "../other";

const ERROR = { error : expect.any(String) };

beforeEach(() => {
    clear();
});

describe('testing for return type', () => {
    test.todo('has correct return type');
});

describe('testing authUserId in adminPasswordUpdate', () => {
    test.todo('when authUserId is not a valid user, from adminAuthRegister');
    test.todo('when authUserId is not a valid user, from adminAuthLogin');

    test.todo('when authUserId is a valid user from adminAuthRegister');
    test.todo('when authUserIs is a valid user from adminAuthLogin');
});

descirbe('testing oldPassword in adminPasswordUpdate', () => {
    test.todo('old password is not the correct old password');
    test.todo('old password and new password match exactly');
    test.todo('old password is the correct old password');
});

describe('testing newPassword in adminPasswordUpdate', () => {
    test.todo('new password has already been used before by the user');
    test.todo('new password is less than 8 characters');
    test.todo('new password does not contain at least one number and at least one letter');
    test.todo('new password meets all criteria');
});

describe('testing side-effects from adminPasswordUpdate', () => {
    test.todo('successful login (adminAuthLogin) with newPassword');
});