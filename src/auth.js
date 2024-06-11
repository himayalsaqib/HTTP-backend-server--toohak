import { setData, getData } from './dataStore';
import validator from 'validator';

/**
 * Register a user with an email, password, and names, then returns their authUserId value
 * 
 * @param {string} email 
 * @param {string} password 
 * @param {string} nameFirst 
 * @param {string} nameLast 
 * @returns {object} authUserId | error
 */
export function adminAuthRegister (email, password, nameFirst, nameLast) {
  if (emailInUse(email)) {
    return { error: 'email address is used by another user' };
  }  
  if (validator.isEmail(email) === false) {
    return { error: 'invalid email address' };
  }
  if (password.length < 8 || hasNumber(password) === false || hasLetter(password) === false) {
    return { error: 'invalid password does not meet requirements' };
  }
  if (nameisvalid(nameFirst) === false || nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: 'invalid first name does not meet requirements' };
  }
  if (nameisvalid(nameLast) === false || nameLast.length < 2 || nameLast.length > 20) {
    return { error: 'invalid last name does not meet requirements' };
  }

  let data = getData();

  const authUserId = data.users.length;

  const newUser = {
    nameFirst: nameFirst,
    nameLast: nameLast,
    password: password,
    userId: authUserId,
    email: email,
    numFailedLogins: 0,
    numSuccessfulLogins: 0,
  }

  data.users.push(newUser);

  setData(data);

  return { authUserId: authUserId };
}

/**
 * Given a registered user's email and password returns their authUserId value
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {object} authUserId
 */

function adminAuthLogin (email, password) {
    return {
        authUserId: 1,
    };
}

/**
 * Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated with a single space 
 * between them.
 * 
 * @param {number} authUserId
 * @returns {object} user 
 */
function adminUserDetails (authUserId) {
    return { user:
        {
          userId: 1,
          name: 'Hayden Smith',
          email: 'hayden.smith@unsw.edu.au',
          numSuccessfulLogins: 3,
          numFailedPasswordsSinceLastLogin: 1,
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
 * @returns {object} empty
 */
function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
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
 * @returns {object} empty
 */
function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  return {};
}

/////////////////////////////// Helper Functions ///////////////////////////////

/**
 * Function checks if an email is already being used by an existing user
 *
 * @param {string} email
 * @returns {boolean} true if email exists, false if not
 */
function emailInUse(email) {
  let data = getData();

  for (const user of data.users) {
    if (user.email === email) {
      return true;
    }
  }

  return false;
}

/**
 * Function checks if a name is valid (ie doesn't contain a number or 
 * special characters other than spaces, hyphens or apostrophes)
 *
 * @param {string} name
 * @returns {boolean} true if a name is valid otherwise false
 */
function nameisvalid(name) {
  const specialCharacters = /[!@#$%^&*()_+{}\[\]:;<>,.?\/\\~]/;

  if (specialCharacters.test(name) || hasNumber(name)) {
    return false;
  }

  return true;
}

/**
 * Function returns true if string contains a number otherwise it returns false
 *
 * @param {string} string to check
 * @returns {boolean} true if string has a number otherwise false
 */
function hasNumber(string) {
  return /\d/.test(string);
}

/**
 * Function returns true if string contains a letter otherwise it returns false
 *
 * @param {string} string to check
 * @returns {boolean} true if string has a letter otherwise false
 */
function hasLetter(string) {
  return /[a-zA-Z]/.test(string);
}
