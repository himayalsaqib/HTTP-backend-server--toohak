// includes auth functions

import { setData, getData, ErrorObject, EmptyObject, Tokens } from './dataStore';
import validator from 'validator';
import {
  adminEmailInUse,
  adminUserNameIsValid,
  adminPasswordHasValidChars,
  authUserIdExists,
  adminCheckPasswordHistory,
  findUserById,
  findUserByEmail
} from './helper-files/helper';

/// //////////////////////////// Global Variables ///////////////////////////////
const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 20;
const INITIAL_NUM_FAILED_LOGINS = 0;
const INITIAL_NUM_SUCCESSFUL_LOGINS = 1;

/// /////////////////////////// Type Annotations ///////////////////////////////
interface UserDetails {
  userId: number;
  name: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

/// ////////////////////////////// Functions ///////////////////////////////////
/**
 * Register a user with an email, password, and names, then returns their
 * authUserId value
 *
 * @param {string} email
 * @param {string} password
 * @param {string} nameFirst
 * @param {string} nameLast
 * @returns {{ authUserId: number } | { error: string }}
 */
export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): { authUserId: number } | ErrorObject {
  if (adminEmailInUse(email)) {
    return { error: 'Email address is used by another user.' };
  }
  if (!validator.isEmail(email)) {
    return { error: 'Invalid email address.' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: 'Invalid password is less than 8 characters.' };
  }
  if (!adminPasswordHasValidChars(password)) {
    return { error: 'Invalid password does not meet requirements.' };
  }
  if (nameFirst.length < MIN_NAME_LENGTH || nameFirst.length > MAX_NAME_LENGTH) {
    return {
      error: 'Invalid first name is less than 2 characters or more than 20 characters.'
    };
  }
  if (!adminUserNameIsValid(nameFirst)) {
    return { error: 'Invalid first name does not meet requirements.' };
  }
  if (nameLast.length < MIN_NAME_LENGTH || nameLast.length > MAX_NAME_LENGTH) {
    return {
      error: 'Invalid last name is less than 2 characters or more than 20 characters.'
    };
  }
  if (!adminUserNameIsValid(nameLast)) {
    return { error: 'Invalid last name does not meet requirements.' };
  }

  const data = getData();

  let newAuthUserId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  while (authUserIdExists(newAuthUserId)) {
    newAuthUserId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  const newUser = {
    authUserId: newAuthUserId,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    password: password,
    previousPasswords: [password],
    numFailedLogins: INITIAL_NUM_FAILED_LOGINS,
    numSuccessfulLogins: INITIAL_NUM_SUCCESSFUL_LOGINS,
  };

  data.users.push(newUser);

  setData(data);

  return { authUserId: newAuthUserId };
}

/**
 * Given a registered user's email and password returns their authUserId value
 *
 * @param {string} email
 * @param {string} password
 * @returns {{ authUserId: number } | { error: string }}
 */

export function adminAuthLogin(email: string, password: string): { authUserId: number } | ErrorObject {
  if (!adminEmailInUse(email)) {
    return { error: 'Email address does not exist.' };
  }
  const user = findUserByEmail(email);
  const data = getData();

  if (user.password === password) {
    user.numFailedLogins = INITIAL_NUM_FAILED_LOGINS;
    user.numSuccessfulLogins++;
    setData(data);

    return { authUserId: user.authUserId };
  } else {
    user.numFailedLogins++;
    setData(data);

    return { error: 'Password is not correct for the given email.' };
  }
}

/**
 * Given an admin user's authUserId, return details about the user.
 *
 * @param {number} authUserId
 * @returns {{ user: UserDetails }}
 */
export function adminUserDetails(authUserId: number): { user: UserDetails } {
  if (!authUserIdExists(authUserId)) {
    throw new Error('AuthUserId is not a valid user.');
  }

  const user = findUserById(authUserId);

  return {
    user:
    {
      userId: user.authUserId,
      name: `${user.nameFirst} ${user.nameLast}`,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedLogins,
    }
  };
}

/**
 * Given details relating to a password change, update the password
 * of a logged in user.
 *
 * @param {number} authUserId
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {{} | { error: string }} empty
 */
export function adminUserPasswordUpdate(authUserId: number, oldPassword: string, newPassword: string): EmptyObject | ErrorObject {
  // check for valid user
  if (!authUserIdExists(authUserId)) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  const user = findUserById(authUserId);

  // check oldPassword
  if (user) {
    if (oldPassword !== user.password) {
      return { error: 'Old password is not the correct old password.' };
    }
  }

  // check for match
  if (oldPassword === newPassword) {
    return { error: 'Old password matches new password exactly.' };
  }

  // check newPassword
  if (user.authUserId === authUserId) {
    // check previousPassword
    if (adminCheckPasswordHistory(authUserId, newPassword) === true) {
      return { error: 'New password has already been used before by this user.' };
    }
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { error: 'Invalid new password is less than 8 characters.' };
  }

  if (!adminPasswordHasValidChars(newPassword)) {
    return {
      error: 'New password must contain at least one number and one letter.'
    };
  }

  // update password for user
  if (user.authUserId === authUserId) {
    user.previousPasswords.push(newPassword);
    user.password = newPassword;
  }
  const data = getData();
  setData(data);

  return {};
}

/**
 * Given an admin user's authUserId and a set of properties,
 * update the properties of this logged in admin user.
 *
 * @param {number} authUserId
 * @param {string} email
 * @param {string} nameFirst
 * @param {string} nameLast
 * @returns {{} | { error: string }} empty | error
 */
export function adminUserDetailsUpdate(authUserId: number, email: string, nameFirst: string, nameLast: string): EmptyObject | ErrorObject {
  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  const userWithEmail = findUserByEmail(email);
  if (userWithEmail) {
    if (userWithEmail.authUserId !== authUserId) {
      return { error: 'Email currently in use by another user.' };
    }
  }

  if (validator.isEmail(email) === false) {
    return { error: 'Invalid email address.' };
  }
  if (adminUserNameIsValid(nameFirst) === false) {
    return {
      error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.'
    };
  }
  if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: 'First name is less than 2 characters or more than 20 characters.' };
  }
  if (adminUserNameIsValid(nameLast) === false) {
    return {
      error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.'
    };
  }
  if (nameLast.length < 2 || nameLast.length > 20) {
    return { error: 'Last name is less than 2 characters or more than 20 characters.' };
  }

  const userToUpdate = findUserById(authUserId);
  if (userToUpdate) {
    userToUpdate.email = email;
    userToUpdate.nameFirst = nameFirst;
    userToUpdate.nameLast = nameLast;
  }

  const data = getData();
  setData(data);

  return {};
}

/**
 * Given a user's token (containing authUserId and sessionId), logout the user.
 * i.e. delete the given token from the tokens array
 *
 * @param {Tokens} token
 * @returns {{} | { error: string }}
 */
export function adminAuthLogout(token: Tokens): EmptyObject | ErrorObject {
  if (authUserIdExists(token.authUserId) === false) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  const data = getData();
  const index = data.tokens.findIndex(currToken => currToken === token);
  data.tokens.splice(index, 1);

  setData(data);

  return {};
}
