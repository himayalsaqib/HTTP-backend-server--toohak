import { getData, Quizzes, Users, Trash } from '../dataStore';

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
  } else {
    return true;
  }
}

/// ///////////////////////// Auth Helper Functions ////////////////////////////
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
  if (/\d/.test(password) && /[a-zA-Z]/.test(password)) {
    return true;
  } else {
    return false;
  }
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

/// ///////////////////////// Quiz Helper Functions ////////////////////////////
/**
 * Function checks if a quiz name contains any invalid characters. Characters
 * are considered invalid if they are not alphanumeric or spaces e.g. @
 *
 * @param {String} name
 * @returns {boolean} true if name does not contain any invalid characters,
 *                    false if it does
 */
export function quizNameHasValidChars(name: string): boolean {
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
export function quizNameInUse(authUserId: number, name: string): boolean {
  const data = getData();

  for (const quiz of data.quizzes) {
    if (quiz.authUserId === authUserId && quiz.name === name) {
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
export function quizIdInUse(quizId: number): boolean {
  const quiz = findQuizById(quizId);

  if (quiz === undefined) {
    const data = getData();
    const trashQuiz = data.trash.find(q => q.quiz.quizId === quizId);
    if (trashQuiz === undefined) {
      return false;
    }
  }
  return true;
}

/**
 * Finds a quiz in the data by its quiz ID
 *
 * @param {number} quizId - The ID of the quiz to find
 * @returns {Quizzes | undefined} - The quiz with the specified ID | undefined
 */
export function findQuizById(quizId: number): Quizzes | undefined {
  const data = getData();
  return data.quizzes.find(q => q.quizId === quizId);
}

/**
 * Finds a quiz in the trash by its quiz ID
 *
 * @param {number} quizId - The ID of the quiz to find
 * @returns {Quizzes | undefined} - The quiz with the specified ID | undefined
 */
export function findTrashedQuizById(quizId: number): Trash | undefined {
  const data = getData();
  return data.trash.find(q => q.quiz.quizId === quizId);
}

/**
 * Function checks if a quiz with a matching quiz ID is in the trash
 *
 * @param {number} quizId - The ID of the quiz to find
 * @returns {boolean} - true if there is a quiz in the trash, false if not
 */
export function quizIsInTrash(quizId: number): boolean {
  const data = getData();
  const quiz = data.trash.find(q => q.quiz.quizId === quizId);
  if (quiz === undefined) {
    return false;
  }
  return true;
}
