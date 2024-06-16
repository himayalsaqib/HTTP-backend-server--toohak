import { adminUserPasswordUpdate, adminAuthRegister, adminAuthLogin } from "../auth";
import { clear } from "../other";

const ERROR = { error : expect.any(String) };

beforeEach(() => {
    clear();
});

test.todo('when authUserId is not a valid user, from adminAuthRegister & adminAuthLogin');

test.todo('old password is not the correct old password');

test.todo('old password and new password match exactly');

test.todo('new password has already been used before by the user');

test.todo('new password is less than 8 characters');

test.todo('new password does not contain at least one number and at least one letter');