import { clear } from './other';
import {
    adminAuthRegister,
    adminAuthLogin,
    adminUserDetails,
    adminUserDetailsUpdate,
    adminUserPasswordUpdate
} from './auth';


describe('clear function', () =>{
    test('has correct return type', () => {
        expect(clear()).toStrictEqual({});
    });

    test('clear successful', () => {
        const idTest = adminAuthRegister('email@email.com', 'password', 'nameFirst', 'nameLast');
        clear();
        expect(adminUserDetails(idTest)).toStrictEqual({ error : expect.any(String)});
    });
});