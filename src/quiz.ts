import { setData, getData } from './dataStore';
import { 
  authUserIdExists,
  quizNameHasValidChars,
  quizNameInUse,
  quizIdInUse
} from './helper';

/// //////////////////////////// Global Variables ///////////////////////////////
const MIN_QUIZ_NAME_LEN = 3;
const MAX_QUIZ_NAME_LEN = 30;
const MAX_DESCRIPTION_LEN = 100;

////////////////////////////////// Interfaces //////////////////////////////////
export interface QuizList {
  quizId: number;
  name: string;
}

export interface QuizInfo {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
}

// should be in dataStore.ts
type EmptyObject = Record<never, never>;

// should be in dataStore.ts
interface ErrorObject {
  error: string;
}

/**
 * @typedef {Object} quizList
 *  @property {number} quizId
 *  @property {string} name
 */

/**
 * @typedef {Object} quizInfo
 *  @property {number} quizId
 *  @property {string} name
 *  @property {number} timeCreated
 *  @property {number} timeLastEdited
 *  @property {string} description
 */

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {number} authUserId
 * @returns {{ quizzes: { quizList }[] } | { error: string }}
 */
export function adminQuizList(authUserId: number): { quizzes: QuizList[] } | ErrorObject {
  let data = getData();
  let quizList = [];

  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId does not refer to a valid user id.' };
  }

  for (const quiz of data.quizzes) {
    if (quiz.authUserId === authUserId) {
      quizList.push({
        quizId: quiz.quizId,
        name: quiz.name,
      });
    }
  }

  return { quizzes: quizList };
}

/**
 * Given basic details about a new quiz, create one for the logged in user
 *
 * @param {number} authUserId
 * @param {string} name
 * @param {string} description
 * @returns {{ quizId: number } | { error: string }} - assigns a quizId | error
 */
export function adminQuizCreate(authUserId: number, name: string, description: string): { quizId: number } | ErrorObject {
  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  if (quizNameHasValidChars(name) === false) {
    return {
      error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.'
    };
  }
  if (name.length < MIN_QUIZ_NAME_LEN || name.length > MAX_QUIZ_NAME_LEN) {
    return {
      error: 'Name is either less than 3 characters long or more than 30 characters long.'
    };
  }
  if (quizNameInUse(authUserId, name) === true) {
    return {
      error: 'Name is already used by the current logged in user for another quiz.'
    };
  }
  if (description.length > MAX_DESCRIPTION_LEN) {
    return { error: 'Description is more than 100 characters in length.' };
  }

  const data = getData();
  let newQuizId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  while (quizIdInUse(newQuizId) === true) {
    newQuizId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  const newQuiz = {
    authUserId: authUserId,
    quizId: newQuizId,
    name: name,
    timeCreated: Date.now(),
    timeLastEdited: undefined,
    description: description,
  };

  data.quizzes.push(newQuiz);
  setData(data);

  return { quizId: newQuizId };
}

/**
 * Given a particular quiz, permanently remove the quiz
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {{} | { error: string }} - an empty object
 */
export function adminQuizRemove (authUserId: number, quizId: number): EmptyObject | ErrorObject {
	let data = getData();

  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId does not refer to a valid user id.' };
  } else if (quizIdInUse(quizId) === false) {
    return { error: 'Quiz Id does not refer to a valid quiz.' };
  }

  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const quiz = data.quizzes[quizIndex];

  if (quiz.authUserId !== authUserId) {
    return { error: 'Quiz does not belong to user.' };
  }

  data.quizzes.splice(quizIndex, 1);
  setData(data);

  return {};
}

/**
 * Get all of the relevant information about the current quiz.
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {{ quizInfo } | { error: string }} - returns quiz information
 */
export function adminQuizInfo (authUserId: number, quizId: number): QuizInfo | ErrorObject {
  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  if (quizIdInUse(quizId) === false) {
    return { error: 'Quiz ID does not refer to a valid quiz.' };
  }

  const data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);

  if (quiz.authUserId !== authUserId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
  };
}

/**
 * Update the name of the relevant quiz.
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} name
 * @returns {{} | { error: string }} - empty object
 */
export function adminQuizNameUpdate (authUserId: number, quizId: number, name: string): EmptyObject | ErrorObject {
  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  if (quizIdInUse(quizId) === false) {
    return { error: 'Quiz ID does not refer to a valid quiz.' };
  }
  if (quizNameHasValidChars(name) === false) {
    return {
      error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.'
    };
  }
  if (name.length < MIN_QUIZ_NAME_LEN || name.length > MAX_QUIZ_NAME_LEN) {
    return {
      error: 'Name is either less than 3 characters long or more than 30 characters long.'
    };
  }
  if (quizNameInUse(authUserId, name)) {
    return {
      error: 'Name is already used by the current logged in user for another quiz.'
    };
  }

  const data = getData();
  const quiz = data.quizzes.find(q => q.quizId === quizId);

  if (quiz.authUserId !== authUserId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  quiz.name = name;
  quiz.timeLastEdited = Date.now();

  setData(data);

  return {};
}

/**
 * Update the description of the relevant quiz
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} description
 * @returns {{} | { error: string }} - an empty object
 */
export function adminQuizDescriptionUpdate (authUserId: number, quizId: number, description: string): EmptyObject | ErrorObject {
  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  if (quizIdInUse(quizId) === false) {
    return { error: 'Quiz ID does not refer to a valid quiz.' };
  }
  if (description.length > MAX_DESCRIPTION_LEN) {
    return { error: 'Description is more than 100 characters in length.' };
  }

  const data = getData();
  const quiz = data.quizzes.find(q => q.quizId === quizId);

  if (quiz.authUserId !== authUserId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  quiz.description = description;
  quiz.timeLastEdited = Date.now();
  
  setData(data);

  return {};
}
