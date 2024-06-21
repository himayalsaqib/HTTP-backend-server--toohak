import { getData } from "./dataStore";

/**
 * Function checks if an email is already being used by an existing user
 *
 * @param {string} email
 * @returns {boolean} true if email exists, false if not
 */
export function adminEmailInUse(email) {
  const data = getData();

  const user = data.users.find(user => user.email === email);

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
export function adminUserNameIsValid(name) {
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
export function adminPasswordHasValidChars(password) {
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
export function adminUserIdExists(authUserId) {
  let data = getData();

  const user = data.users.find(user => user.authUserId === authUserId);

  if (user === undefined) {
    return false;
  } else {
    return true;
  }
}

/**
 * Function checks previousPassword array to determine whether a user has already
 * used a password when updating the password
 * 
 * @param {number} authUserId
 * @param {number} newPassword
 * @returns {boolean} true if newPassword matches any previous passwords
 */
export function checkPasswordHistory(authUserId, newPassword) {
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

/**
 * Function checks if a quiz name contains any invalid characters. Characters
 * are considered invalid if they are not alphanumeric or spaces e.g. @
 *
 * @param {String} name
 * @returns {boolean} true if name does not contain any invalid characters, 
 *                    false if it does
 */
export function quizNameHasValidChars(name) {
  if (/^[A-Za-z0-9 ]*$/.test(name) === false) {
    return false;
  } else {
    return true;
  }
}

/**
 * Function checks if a quiz name has already been used by the current logged
 * in user
 *
 * @param {Number} authUserId
 * @param {String} name
 * @returns {boolean} true if name has been used, false if it has not
 */
export function quizNameInUse(authUserId, name) {
  let data = getData();

  for (const quiz of data.quizzes) {
    if (quiz.authUserId === authUserId && quiz.name == name) {
      return true;
    }
  }
  return false;
}

/**
 * Function checks if a quiz ID has already been used by another quiz
 *
 * @param {Number} quizId
 * @returns {boolean} true if quiz ID has been used, false if it has not
 */
export function quizIdInUse(quizId) {
  let data = getData();

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz === undefined) {
    return false;
  }
  return true;
}