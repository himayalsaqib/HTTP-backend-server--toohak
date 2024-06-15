import { setData, getData } from './dataStore';
import validator from 'validator';

/**
 * Register a user with an email, password, and names, then returns their 
 * authUserId value
 * 
 * @param {string} email 
 * @param {string} password 
 * @param {string} nameFirst 
 * @param {string} nameLast 
 * @returns {object} authUserId | error
 */
export function adminAuthRegister (email, password, nameFirst, nameLast) {
  if (adminEmailInUse(email)) {
    return { error: 'email address is used by another user' };
  }  
  if (validator.isEmail(email) === false) {
    return { error: 'invalid email address' };
  }
  if (password.length < 8) {
    return { error: 'invalid password is less than 8 characters' };
  }
  if (adminStringHasNum(password) === false || adminStringHasLetter(password) === false) {
    return { error: 'invalid password does not meet requirements' };
  }
  if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: 'invalid first name is less than 2 characters or \
            more than 20 characters' };
  }
  if (adminUserNameIsValid(nameFirst) === false) {
    return { error: 'invalid first name does not meet requirements' };
  }
  if (nameLast.length < 2 || nameLast.length > 20) {
    return { error: 'invalid last name is less than 2 characters or \
            more than 20 characters' };
  }
  if (adminUserNameIsValid(nameLast) === false) {
    return { error: 'invalid last name does not meet requirements' };
  }

  let data = getData();

  const authUserId = data.users.length;

  const newUser = {
    authUserId: authUserId,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    password: password,
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

export function adminAuthLogin (email, password) {
    return {
        authUserId: 1,
    };
}

/**
 * Given an admin user's authUserId, return details about the user. 
 * 
 * @param {number} authUserId
 * @returns {object} user 
 */
export function adminUserDetails (authUserId) {
  if (!adminUserIdIsValid(authUserId)) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  let data = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      return { user:
        {
          userId: user.authUserId,
          name: `${user.nameFirst} ${user.nameLast}`,
          email: user.email,
          numSuccessfulLogins: user.numSuccessfulLogins,
          numFailedPasswordsSinceLastLogin: user.numFailedLogins,
        }
      };
    }
  }
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
export function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
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
export function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  if (adminUserIdIsValid(authUserId) == false) {
    return { error: 'AuthUserId is not a valid user' };
  }
  if (adminEmailInUse(email) === true) {
    return { error: 'Email is currently used by another user' };
  } 
  if (validator.isEmail(email) === false) {
    return { error: 'Invalid email address' };
  }
  if (adminUserNameIsValid(nameFirst) === false) {
    return { error: 'NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
  }
  if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: 'NameFirst is less than 2 characters or more than 20 characters' };
  }
  if (adminUserNameIsValid(nameLast) === false) {
    return { error: 'NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
  }
  if (nameLast.length < 2 || nameLast.length > 20) {
    return { error: 'NameLast is less than 2 characters or more than 20 characters' };
  }

  let data = getData();

  for (const user of data.users) {
    if (user.authUserID === authUserId) {
      user.email = email;
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
    }
  }

  setData(data);
  
  return {};
}

/////////////////////////////// Helper Functions ///////////////////////////////

/**
 * Function checks if an email is already being used by an existing user
 *
 * @param {string} email
 * @returns {boolean} true if email exists, false if not
 */
function adminEmailInUse(email) {
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
function adminUserNameIsValid(name) {
  // specialCharacters will match any string that includes a special 
  // character except for space, hyphen or apostrophe
  const specialCharacters = /[^\w\s'-]/;

  if (specialCharacters.test(name) || adminStringHasNum(name)) {
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
function adminStringHasNum(string) {
  return /\d/.test(string);
}

/**
 * Function returns true if string contains a letter otherwise it returns false
 *
 * @param {string} string to check
 * @returns {boolean} true if string has a letter otherwise false
 */
function adminStringHasLetter(string) {
  return /[a-zA-Z]/.test(string);
}

/**
 * Function checks if an authUserId exists in the dataStore and is valid
 *
 * @param {number} authUserId 
 * @returns {boolean} true if authUserId is valid otherwise false
 */
function adminUserIdIsValid(authUserId) {
  let data = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      return true;
    }
  }

  return false;
}
