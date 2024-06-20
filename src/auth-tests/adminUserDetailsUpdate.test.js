// contains the tests adminUserDetailsUpdate from auth.js

import { adminAuthRegister, adminUserDetails, adminUserDetailsUpdate } from '../auth';
import { clear } from '../other';

describe('adminUserDetailsUpdate', () => {
  const error = { error: expect.any(String) };
  let user;
  beforeEach(() => {
    clear();
    user = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
  });

  describe('Testing correct return', () => {
    test('Successful update has the correct return type', () => {
      expect(adminUserDetailsUpdate(user.authUserId, 'newEmail@gmail.com', 
      'Jamie', 'David')).toStrictEqual({});
    });
  });

  describe('Testing side effect', () => {
    test('Successful side effect: adminUserDetails returns newly updated properties', () => {
      adminUserDetailsUpdate(user.authUserId, 'valid2@gmail.com', 'Not Jane', 'Not Doe');
      expect(adminUserDetails(user.authUserId)).toStrictEqual({ user: 
        { userId: user.authUserId, name: 'Not Jane Not Doe', 
        email: 'valid2@gmail.com', numSuccessfulLogins: expect.any(Number), 
        numFailedPasswordsSinceLastLogin: expect.any(Number) }
      });
    });
  });    

  describe('Testing error returns for authUserId', () => {
    test('AuthUserId is not a valid user', () => {
      expect(adminUserDetailsUpdate(user.authUserId + 1, 'valid1@gmail.com', 
      'Jane', 'Doe')).toStrictEqual( error );
    });
  });

  describe('Testing error returns for email', () => {
    test('Email is currently used by another user', () => {
      adminAuthRegister('valid2@gmail.com', 'Password12', 'Jane', 'Doe');
      expect(adminUserDetailsUpdate(user.authUserId, 'valid2@gmail.com', 
      	'Jane', 'Doe')).toStrictEqual( error );
    });

    test('Returns error when email is not valid', () => {
      expect(adminUserDetailsUpdate(user.authUserId, 'invalid1.com', 
        'Jane', 'Doe')).toStrictEqual( error );
    });
  });

  describe('Testing error returns for names', () => {
    test('Returns error when nameFirst contains invalid characters ' +
				'(not space, apostrophe or hyphen)', () => {
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

    test('Returns error when nameLast contains invalid characters ' +
				'(not space, apostrophe or hyphen)', () => {
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
});
