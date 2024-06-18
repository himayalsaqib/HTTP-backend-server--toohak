import { adminUserPasswordUpdate, adminAuthRegister, adminAuthLogin } from "../auth";
import { clear } from "../other";

beforeEach(() => {
    clear();
});

descibe('adminUserPasswordUpdate', () => {

    const ERROR = { error : expect.any(String) };

    describe('testing for return type', () => {
        beforeEach(() => {
            const originalPassword = 'validpa55word';
            const user = adminAuthRegister('valid@gmail.com', originalPassword, 'Jane', 'Doe');
            const changedPassword = 'password123';
        });
        
        test('has correct return type', () => {
            expect(adminUserPasswordUpdate(user.authUserId, originalPassword, changedPassword)).
            toStrictEqual({});
        });
    });

    describe('testing authUserId in adminPasswordUpdate', () => {
        beforeEach(() => {
            const ogPassword = 'validpa55w0rd';
            const user = adminAuthRegister('valid123@gmail.com', ogPassword, 'John', 'Smith');
            const changedPassword = 'an0thervalid0ne';
        });
        
        test('when authUserId is not a valid user, from adminAuthRegister', () => {
            expect(adminUserPasswordUpdate(user.authUserId + 1, ogPassword, changedPassword)).
            toStrictEqual(ERROR);
        });
    });

    describe('testing oldPassword in adminPasswordUpdate', () => {
        test('oldPassword is not the correct oldPassword', () => {
            beforeEach(() => {
                const ogPassword = 'val1dpassword';
                const user = adminAuthRegister('valid@gmail.com', ogPassword, 'Jane', 'Smith');
                const incorretOgPassword = 'validpassw0rd';
                const alteredPassword = 'newvalidpa55word';
            });
            
            expect(adminUserPasswordUpdate(user.authUserId, incorretOgPassword, alteredPassword)).
            toStrictEqual(ERROR);
        });
    
        test('oldPassword and newPassword match exactly', () => {
            beforeEach(() => {
                const originalPassword = 'validpa55word';
                const user = adminAuthRegister('valid@gmail.com', originalPassword, 'Jake', 'Smith');
                const changedPassword = 'validpa55word';
            });
            
            expect(adminUserPasswordUpdate(user.authUserId, originalPassword, changedPassword)).
            toStrictEqual(ERROR);
        });
    });
    
    describe('testing newPassword in adminPasswordUpdate', () => {
        test('newPassword has already been used before by the user', () => {
            beforeEach(() =>{
                const originalPassword = 'avalidpa55word';
                const user = adminAuthRegister('valid123@gmail.com', originalPassword, 'Jane', 'Doe');
    
                const changedPassword = 'an0therpassw0rd';
                const alternatePassword = 'passw0rd123';
            });
            
            // first password update
            adminUserPasswordUpdate(user.authUserId, originalPassword, changedPassword);
    
            // second password update
            adminUserPasswordUpdate(user.authUserId, changedPassword, alternatePassword);
            
            // update to a password that was used previously by the user
            expect(adminUserPasswordUpdate(user.authUserId, alternatePassword, originalPassword)).toStrictEqual(ERROR);
        });
    
        test('newPassword is less than 8 characters', () => {
            beforeEach(() => {
                const originalPassword = 'validpa55word';
                const changedPassword = 'inva1d';
                const user = adminAuthRegister('valid@gmail.com', originalPassword, 'John', "Smith");
            });
                        
            expect(adminUserPasswordUpdate(user.authUserId, originalPassword, changedPassword)).
            toStrictEqual(ERROR);
        });
    
        test('newPassword does not contain at least one number', () => {
            beforeEach(() => {
                const ogPassword = 'Avalidpa55word';
                const badNewPassword = 'invalidpassword';
                const user = adminAuthRegister('valid@gmail.com', ogPassword, 'Jane', 'Doe');
            });
                
            expect(adminUserPasswordUpdate(user.authUserId, ogPassword, badNewPassword)).
            toStrictEqual(ERROR);
        });
    
        test('newPassword does not contain at least one letter', () => {
            beforeEach(() => {
                const ogPassword = 'Avalidpa55word';
                const badNewPassword = '123456789';
                const user = adminAuthRegister('valid@gmail.com', ogPassword, 'John', 'Doe');
            });
    
            expect(adminUserPasswordUpdate(user.authUserId, ogPassword, badNewPassword)).
            toStrictEqual(ERROR);
        });
    
        test('newPassword meets all criteria', () => {
            beforeEach(() => {
                const originalPassword = 'validpa55word';
                const changedPassword = 'veryvalidpassw0rd';
                const user = adminAuthRegister('valid@gmail.com', originalPassword, 'John', "Smith");
            });
            
            expect(adminUserPasswordUpdate(user.authUserId, originalPassword, changedPassword)).
            toStrictEqual({});
        });
    });
    
    describe('testing side-effects from adminPasswordUpdate', () => {
        beforeEach(() => {
            const originalPassword = 'validpa55w0rd';
            const user = adminAuthRegister('valid123@gmail.com', originalPassword, 'Jane', 'Smith');
        });
                  
        test('successful login before updating password', () => {
            expect(adminAuthLogin('valid123@gmail.com', originalPassword)).
            toStrictEqual({ authUserId: user.authUserId });
        });
            
        const alteredPassword = 'newpa55word';
            
        test('successful login after updating password', () => {
            adminUserPasswordUpdate(user.authUserId, originalPassword, alteredPassword);
    
            expect(adminAuthLogin('valid123@gmail.com', alteredPassword)).
            toStrictEqual({ authUserId: user.authUserId });
        });
    });
});




