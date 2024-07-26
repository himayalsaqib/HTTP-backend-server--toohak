import { getData, Users } from "../dataStore";
import crypto from 'crypto';

// ========================= OTHER HELPER FUNCTIONS ========================= //

/**
 * Function gets the current time in seconds to 10 significant figures
 *
 * @returns {number} time
 */
export function currentTime(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Function generates and returns a random integer for ids
 *
 * @returns {number}
 */
export function getRandomInt(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

// ========================= AUTH HELPER FUNCTIONS ========================== //

/**
 * Function checks if an authUserId exists in the dataStore
 *
 * @param {number} authUserId
 * @returns {boolean} true if authUserId is valid otherwise false
 */
export function authUserIdExists(authUserId: number): boolean {
  const user = findUserById(authUserId);

  if (user === undefined) {
    return false;
  }
  return true;
}

/**
 * Function checks if an email is already being used by an existing user
 *
 * @param {string} email
 * @returns {boolean} true if email exists, false if not
 */
export function adminEmailInUse(email: string): boolean {
  const user = findUserByEmail(email);

  if (user === undefined) {
    return false;
  } else {
    return true;
  }
}

/**
 * Function checks if a name is valid (ie doesn't contain a number or
 * special characters other than spaces, hyphens or apostrophes)
 *
 * @param {string} name
 * @returns {boolean} true if a name is valid otherwise false
 */
export function adminUserNameIsValid(name: string): boolean {
  // specialCharacters will match any string that includes a special
  // character except for space, hyphen or apostrophe
  const specialCharacters = /[^A-Za-z\s'-]/;
  if (specialCharacters.test(name)) {
    return false;
  } else {
    return true;
  }
}

/**
 * Function checks whether the given password contains atleast one number and
 * atleast one letter
 *
 * @param {string} password to check
 * @returns {boolean} true if password has neccessary chars otherwise false
 */
export function adminPasswordHasValidChars(password: string): boolean {
  return /\d/.test(password) && /[a-zA-Z]/.test(password);
}

/**
 * Function checks previousPassword array to determine whether a user has already
 * used a password when updating the password
 *
 * @param {number} authUserId
 * @param {string} newPassword
 * @returns {boolean} true if newPassword matches any previous passwords
 */
export function adminCheckPasswordHistory(authUserId: number, newPassword: string): boolean {
  const user = findUserById(authUserId);
  for (const password of user.previousPasswords) {
    if (password === newPassword) {
      return true;
    }
  }

  return false;
}

/**
 * Finds a user in the data store by authUserId
 *
 * @param {number} authUserId - The authUserId to find
 * @returns {Users | undefined} - The user object if found | undefined
 */
export function findUserById(authUserId: number): Users | undefined {
  const data = getData();
  return data.users.find(user => user.authUserId === authUserId);
}

/**
 * Finds a user in the data store by email
 *
 * @param {string} email - The email to find
 * @returns {Users | undefined} - The user object if found | undefined
 */
export function findUserByEmail(email: string): Users | undefined {
  const data = getData();
  return data.users.find(user => user.email === email);
}

/**
 * generates a sha256 hash for given password
 *
 * @param {string} password
 * @returns {string} hash of password
 */
export function getHashOf(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}
