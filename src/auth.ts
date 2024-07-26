// includes auth functions

import { setData, getData, EmptyObject, Tokens } from './dataStore';
import validator from 'validator';
import {
  adminEmailInUse,
  adminUserNameIsValid,
  adminPasswordHasValidChars,
  authUserIdExists,
  adminCheckPasswordHistory,
  findUserById,
  findUserByEmail,
  getHashOf,
  getRandomInt
} from './helper-files/helper';

// ============================ GLOBAL VARIABLES ============================ //
const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 20;
const INITIAL_NUM_FAILED_LOGINS = 0;
const INITIAL_NUM_SUCCESSFUL_LOGINS = 1;

// ============================ TYPE ANNOTATIONS ============================ //
export interface UserDetails {
  userId: number;
  name: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

// =============================== FUNCTIONS ================================ //
/**
 * Register a user with an email, password, and names, then returns their
 * authUserId value
 *
 * @param {string} email
 * @param {string} password
 * @param {string} nameFirst
 * @param {string} nameLast
 * @returns {{ authUserId: number }}
 */
export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): { authUserId: number } {
  if (adminEmailInUse(email)) {
    throw new Error('Email address is used by another user.');
  }
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email address.');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error('Invalid password is less than 8 characters.');
  }
  if (!adminPasswordHasValidChars(password)) {
    throw new Error('Invalid password does not meet requirements.');
  }
  if (nameFirst.length < MIN_NAME_LENGTH || nameFirst.length > MAX_NAME_LENGTH) {
    throw new Error('Invalid first name is less than 2 characters or more than 20 characters.');
  }
  if (!adminUserNameIsValid(nameFirst)) {
    throw new Error('Invalid first name does not meet requirements.');
  }
  if (nameLast.length < MIN_NAME_LENGTH || nameLast.length > MAX_NAME_LENGTH) {
    throw new Error('Invalid last name is less than 2 characters or more than 20 characters.');
  }
  if (!adminUserNameIsValid(nameLast)) {
    throw new Error('Invalid last name does not meet requirements.');
  }

  const data = getData();

  let newAuthUserId = getRandomInt();
  while (authUserIdExists(newAuthUserId)) {
    newAuthUserId = getRandomInt();
  }

  data.users.push({
    authUserId: newAuthUserId,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    password: getHashOf(password),
    previousPasswords: [getHashOf(password)],
    numFailedLogins: INITIAL_NUM_FAILED_LOGINS,
    numSuccessfulLogins: INITIAL_NUM_SUCCESSFUL_LOGINS,
  });

  setData(data);

  return { authUserId: newAuthUserId };
}

/**
 * Given a registered user's email and password returns their authUserId value
 *
 * @param {string} email
 * @param {string} password
 * @returns {{ authUserId: number }}
 */

export function adminAuthLogin(email: string, password: string): { authUserId: number } {
  if (!adminEmailInUse(email)) {
    throw new Error('Email address does not exist.');
  }
  const user = findUserByEmail(email);
  const data = getData();

  if (user.password === getHashOf(password)) {
    user.numFailedLogins = INITIAL_NUM_FAILED_LOGINS;
    user.numSuccessfulLogins++;
    setData(data);

    return { authUserId: user.authUserId };
  } else {
    user.numFailedLogins++;
    setData(data);

    throw new Error('Password is not correct for the given email.');
  }
}

/**
 * Given an admin user's authUserId, return details about the user.
 *
 * @param {number} authUserId
 * @returns {{ user: UserDetails }}
 */
export function adminUserDetails(authUserId: number): { user: UserDetails } {
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
 * @returns {{}} empty object
 */
export function adminUserPasswordUpdate(authUserId: number, oldPassword: string, newPassword: string): EmptyObject {
  const user = findUserById(authUserId);

  // check oldPassword
  if (user) {
    if (getHashOf(oldPassword) !== user.password) {
      throw new Error('Old password is not the correct old password.');
    }
  }

  // check for match
  if (oldPassword === newPassword) {
    throw new Error('Old password matches new password exactly.');
  }

  // check newPassword
  if (user.authUserId === authUserId) {
    // check previousPassword
    if (adminCheckPasswordHistory(authUserId, getHashOf(newPassword))) {
      throw new Error('New password has already been used before by this user.');
    }
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error('Invalid new password is less than 8 characters.');
  }

  if (!adminPasswordHasValidChars(newPassword)) {
    throw new Error('New password must contain at least one number and one letter.');
  }

  // update password for user
  if (user.authUserId === authUserId) {
    user.previousPasswords.push(getHashOf(newPassword));
    user.password = getHashOf(newPassword);
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
 * @returns {{}} empty | error
 */
export function adminUserDetailsUpdate(authUserId: number, email: string, nameFirst: string, nameLast: string): EmptyObject {
  const userWithEmail = findUserByEmail(email);
  if (userWithEmail) {
    if (userWithEmail.authUserId !== authUserId) {
      throw new Error('Email currently in use by another user.');
    }
  }

  if (validator.isEmail(email) === false) {
    throw new Error('Invalid email address.');
  }
  if (adminUserNameIsValid(nameFirst) === false) {
    throw new Error('First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.');
  }
  if (nameFirst.length < 2 || nameFirst.length > 20) {
    throw new Error('First name is less than 2 characters or more than 20 characters.');
  }
  if (adminUserNameIsValid(nameLast) === false) {
    throw new Error('Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.');
  }
  if (nameLast.length < 2 || nameLast.length > 20) {
    throw new Error('Last name is less than 2 characters or more than 20 characters.');
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
 * @returns {{}}
 */
export function adminAuthLogout(token: Tokens): EmptyObject {
  const data = getData();
  const index = data.tokens.findIndex(currToken => currToken === token);
  data.tokens.splice(index, 1);

  setData(data);

  return {};
}
