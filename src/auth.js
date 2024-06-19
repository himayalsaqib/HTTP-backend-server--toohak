import { setData, getData } from './dataStore';
import validator from 'validator';

/////////////////////////////// Global Variables ///////////////////////////////
const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 20;
const INITIAL_NUM_FAILED_LOGINS = 0;
const INITIAL_NUM_SUCCESSFUL_LOGINS = 1;

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
export function adminAuthRegister (email, password, nameFirst, nameLast) {
  if (adminEmailInUse(email)) {
    return { error: 'email address is used by another user' };
  }  
  if (!validator.isEmail(email)) {
    return { error: 'invalid email address' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: 'invalid password is less than 8 characters' };
  }
  if (!adminPasswordHasValidChars(password)) {
    return { error: 'invalid password does not meet requirements' };
  }
  if (nameFirst.length < MIN_NAME_LENGTH || nameFirst.length > MAX_NAME_LENGTH) {
    return { error: 'invalid first name is less than 2 characters or \
            more than 20 characters' };
  }
  if (!adminUserNameIsValid(nameFirst)) {
    return { error: 'invalid first name does not meet requirements' };
  }
  if (nameLast.length < MIN_NAME_LENGTH || nameLast.length > MAX_NAME_LENGTH) {
    return { error: 'invalid last name is less than 2 characters or \
            more than 20 characters' };
  }
  if (!adminUserNameIsValid(nameLast)) {
    return { error: 'invalid last name does not meet requirements' };
  }

  let data = getData();

  const authUserId = Math.random();
  while (adminUserIdExists(authUserId)) {
      authUserId = Math.random();
  }

  const newUser = {
    authUserId: authUserId,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    password: password,
    previousPasswords: [password],
    numFailedLogins: INITIAL_NUM_FAILED_LOGINS,
    numSuccessfulLogins: INITIAL_NUM_SUCCESSFUL_LOGINS,
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
  if (!adminEmailInUse(email)) {
    return { error: 'email address does not exist' };
  }

  let data = getData();

  for (const user of data.users) {
    if (user.email === email) {
      if (user.password === password) {
        user.numFailedLogins = INITIAL_NUM_FAILED_LOGINS;
        user.numSuccessfulLogins++;
        setData(data);

        return { authUserId: user.authUserId };
      } else {
        user.numFailedLogins++;
        setData(data);
        
        return { error: 'password is not correct for the given email' };
      }
    }
  }
}

/**
 * Given an admin user's authUserId, return details about the user. 
 * 
 * @param {number} authUserId
 * @returns {object} user 
 */
export function adminUserDetails (authUserId) {
  if (!adminUserIdExists(authUserId)) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  const data = getData();

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

  let data = getData();

  // check for valid user
  if (!adminUserIdExists(authUserId)) {
    return { error : 'authUserId is not a valid user'};
  }

  // check oldPassword
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      if (oldPassword !== user.password) {
        return { error : 'oldPassword is not the correct old password'}
      }
    }
  }

  // check for match
  if (oldPassword === newPassword) {
    return { error : 'oldPassword matches newPassword exactly'};
  }

  // check newPassword
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      // check previousPassword
      if (checkPasswordHistory(authUserId, newPassword) === true) {
        return { error : 'newPassword has already been used before by this user'};
      }
    }
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { error : 'invalid newPassword is less than 8 charactes'};
  }

  if (!adminPasswordHasValidChars(newPassword)) {
    return { error : 'newPassword must contain at least one number and one letter'};
  }

  // update password for user
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      user.previousPasswords.push(newPassword);
      user.password = newPassword;
    }
  }

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
 * @returns {object} empty | error
 */
export function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  if (adminUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId is not a valid user' };
  }

  let data = getData();

  for (const user of data.users) {
    if (user.email === email) {
      if (user.authUserId === authUserId) {
        break;
      } else {
        return { error: 'Email currently in use by another user'};
      }
    }
  }

  if (validator.isEmail(email) === false) {
    return { error: 'Invalid email address' };
  }
  if (adminUserNameIsValid(nameFirst) === false) {
    return { error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
  }
  if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: 'First name is less than 2 characters or more than 20 characters' };
  }
  if (adminUserNameIsValid(nameLast) === false) {
    return { error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
  }
  if (nameLast.length < 2 || nameLast.length > 20) {
    return { error: 'Last name is less than 2 characters or more than 20 characters' };
  }

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
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
  const specialCharacters = /[^A-Za-z\s'-]/;
  if (specialCharacters.test(name)) {
    return false;
  }

  return true;
}

/**
 * Function checks whether the given password contains atleast one number and 
 * atleast one letter
 * 
 * @param {string} password to check
 * @returns {boolean} true if password has neccessary chars otherwise false
 */
function adminPasswordHasValidChars(password) {
  if (/\d/.test(password) && /[a-zA-Z]/.test(password)) {
    return true;
  } else {
    return false;
  }
}

/**
 * Function checks if an authUserId exists in the dataStore 
 *
 * @param {number} authUserId 
 * @returns {boolean} true if authUserId is valid otherwise false 
 */
function adminUserIdExists(authUserId) {
  let data = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      return true;
    }
  }

  return false;
}

/**
 * Function checks previousPassword array to determine whether a user has already
 * used a password when updating the password
 * 
 * @param {number} authUserId
 * @param {number} newPassword
 * 
 * @returns {boolean} true if newPassword matches any previous passwords
 */
function checkPasswordHistory(authUserId, newPassword) {
  let data = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      for (const password of user.previousPasswords) {
        if (password === newPassword) {
          return true;
        } 
      }
    }
  }

  return false;
}
