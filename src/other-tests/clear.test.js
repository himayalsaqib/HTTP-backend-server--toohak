import { clear } from "../other";
import {
	adminAuthRegister,
	adminAuthLogin,
	adminUserDetails
} from "../auth";

describe('clear', () =>{
	describe('Test for the return type of clear', () => {
		test('Has correct return type', () => {
			expect(clear()).toStrictEqual({});
		});
	});
    
	describe('Testing side-effects of clear', () => {
		let user;
		beforeEach(() => {
			user = adminAuthRegister('email@gmail.com', 'password123', 'Jane', 'Doe');
		});
		
		test('Successful registration of user', () => {
			expect(user).toStrictEqual({ authUserId : user.authUserId });
		});

		test('Successful access of user details in adminUserDetails after logging in once', () => {
			let newUser = adminAuthRegister('valid@gmail.com', 'validpa55word', 'John', 'Smith');
			expect(adminAuthLogin('valid@gmail.com', 'validpa55word')).toStrictEqual({ 
				authUserId : newUser.authUserId });
			
			expect(adminUserDetails(newUser.authUserId)).toStrictEqual({
				user: {
					userId: newUser.authUserId,
					name: 'John Smith',
					email: 'valid@gmail.com',
					numSuccessfulLogins: 2,
					numFailedPasswordsSinceLastLogin: 0,
				}
			});
		});
        
		test('Error returned by adminUserDetails after calling clear', () => {
			clear();
			expect(adminUserDetails(user.authUserId)).toStrictEqual({ error : expect.any(String) });
		});
  });
});