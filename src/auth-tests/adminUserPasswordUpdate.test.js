import { adminUserPasswordUpdate, adminAuthRegister, adminAuthLogin } from "../auth";
import { clear } from "../other";

beforeEach(() => {
    clear();
});

describe('adminUserPasswordUpdate', () => {
    
    const ERROR = { error : expect.any(String) };

    let user, originalPassword;
        beforeEach(() => {
            originalPassword = 'validpa55w0rd';
            user = adminAuthRegister('valid123@gmail.com', originalPassword, 'Jane', 'Smith');
        });

    describe('testing for return type', () => {
        test('has correct return type', () => {
            const changedPassword = 'password123';
            
            expect(adminUserPasswordUpdate(user.authUserId, originalPassword, changedPassword)).
            toStrictEqual({});
        });
    });

    describe('testing authUserId in adminPasswordUpdate', () => {
        test('when authUserId is not a valid user, from adminAuthRegister', () => {
            const changedPassword = 'an0thervalid0ne';
    
            expect(adminUserPasswordUpdate(user.authUserId + 1, originalPassword, changedPassword)).
            toStrictEqual(ERROR);
        });
    });

    describe('testing oldPassword in adminPasswordUpdate', () => {
        test('oldPassword is not the correct oldPassword', () => {
            const incorretOgPassword = 'validpassw0rd';
            const alteredPassword = 'newvalidpa55word';
    
            expect(adminUserPasswordUpdate(user.authUserId, incorretOgPassword, alteredPassword)).
            toStrictEqual(ERROR);
        });
    
        test('oldPassword and newPassword match exactly', () => {
            const matchingPassword = 'validpa55word';
            const changedPassword = 'validpa55word';
            
            expect(adminUserPasswordUpdate(user.authUserId, matchingPassword, changedPassword)).
            toStrictEqual(ERROR);
        });
    });
    
    describe('testing newPassword in adminPasswordUpdate', () => {
        test('newPassword has already been used before by the user', () => {
    
            const changedPassword = 'an0therpassw0rd';
            const alternatePassword = 'passw0rd123';
            
            // first password update
            adminUserPasswordUpdate(user.authUserId, originalPassword, changedPassword);
    
            // second password update
            adminUserPasswordUpdate(user.authUserId, changedPassword, alternatePassword);
            
            // update to a password that was used previously by the user
            expect(adminUserPasswordUpdate(user.authUserId, alternatePassword, originalPassword)).toStrictEqual(ERROR);
        });
    
        test('newPassword is less than 8 characters', () => {
            //const originalPassword = 'validpa55word';
            const changedPassword = 'inva1d';
            //const user = adminAuthRegister('valid@gmail.com', originalPassword, 'John', "Smith");
            
            expect(adminUserPasswordUpdate(user.authUserId, originalPassword, changedPassword)).
            toStrictEqual(ERROR);
        });
    
        test('newPassword does not contain at least one number', () => {
            //const ogPassword = 'Avalidpa55word';
            const badNewPassword = 'invalidpassword';
            //const user = adminAuthRegister('valid@gmail.com', ogPassword, 'Jane', 'Doe');
    
            expect(adminUserPasswordUpdate(user.authUserId, originalPassword, badNewPassword)).
            toStrictEqual(ERROR);
        });
    
        test('newPassword does not contain at least one letter', () => {
            //const ogPassword = 'Avalidpa55word';
            const badNewPassword = '123456789';
            //const user = adminAuthRegister('valid@gmail.com', ogPassword, 'John', 'Doe');
    
            expect(adminUserPasswordUpdate(user.authUserId, originalPassword, badNewPassword)).
            toStrictEqual(ERROR);
        });
    
        test('newPassword meets all criteria', () => {
            //const originalPassword = 'validpa55word';
            const changedPassword = 'veryvalidpassw0rd';
            //const user = adminAuthRegister('valid@gmail.com', originalPassword, 'John', "Smith");
            
            expect(adminUserPasswordUpdate(user.authUserId, originalPassword, changedPassword)).
            toStrictEqual({});
        });
    });
    
    describe('testing side-effects from adminPasswordUpdate', () => {
        // let user, originalPassword;
        // beforeEach(() => {
        //     originalPassword = 'validpa55w0rd';
        //     user = adminAuthRegister('valid123@gmail.com', originalPassword, 'Jane', 'Smith');
        // });
            
        // test('testign authregister', () =>{
        //     expect(adminAuthRegister('valid123@gmail.com', originalPassword, 'Jane', 'Smith')).toStrictEqual({ authUserId : expect.any(Number)});
        // })

        test('successful login before updating password', () => {
            expect(adminAuthLogin('valid123@gmail.com', originalPassword)).
            toStrictEqual({ authUserId : user.authUserId });
        });
            
        test('successful login after updating password', () => {
            expect(adminAuthLogin('valid123@gmail.com', originalPassword)).
            toStrictEqual({ authUserId : user.authUserId });
            const alteredPassword = 'newpa55word';
            adminUserPasswordUpdate(user.authUserId, originalPassword, alteredPassword);
            
            expect(adminAuthLogin('valid123@gmail.com', alteredPassword)).
            toStrictEqual({ authUserId : user.authUserId });
        });
    });
});