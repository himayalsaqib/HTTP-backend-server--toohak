// includes the helper function for server.ts routes

import { ErrorObject, EmptyObject, Tokens, getData, setData } from '../dataStore';
import { getRandomInt } from './authHelper';
import { findQuizById, findTrashedQuizById } from './quizHelper';

// ============================ TYPE ANNOTATIONS ============================ //

export interface Response {
  error?: ErrorObject;
  userToken?: Tokens;
  code?: number;
}

// =============================== FUNCTIONS ================================ //

/**
 * Function checks if a sessionId already exists in the dataStore
 *
 * @param {number} sessionId
 * @returns {boolean} true if sessionId is valid otherwise false
 */
export function sessionIdExists(sessionId: number): boolean {
  const token = findTokenFromSessionId(sessionId);

  if (token === undefined) {
    return false;
  }
  return true;
}

/**
 * Function checks if a token with a matching sessionId exists in the dataStore
 * and checks that the token's authUserId is in the dataStore
 *
 * @param {number} sessionId
 * @returns {void}
 */
export function tokenExists(sessionId: number): void {
  const foundToken = findTokenFromSessionId(sessionId);

  if (foundToken === undefined) {
    throw new Error('SessionId is invalid (does not refer to valid logged in user session)');
  }
}

/**
 * Function checks if a sessionId exists and returns the entire token object or
 * an error
 *
 * @param {number} sessionId
 * @returns {{}}
 */
export function findTokenFromSessionId(sessionId: number): Tokens {
  const data = getData();

  const foundToken = data.tokens.find(foundToken => foundToken.sessionId === sessionId);

  return foundToken;
}

/**
 * Function checks if a quiz belongs to a given current user
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {void}
 * @returns {void}
 */
export function quizBelongsToUser(authUserId: number, quizId: number): void {
  const quiz = findQuizById(quizId);
  if (quiz === undefined || quiz.authUserId !== authUserId) {
    throw new Error('User is not an owner of this quiz or quiz does not exist.');
  }
}

/**
 * Function checks if a quiz in the trash belongs to a given current user
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {void}
 */
export function trashedQuizBelongsToUser(authUserId: number, quizId: number): void {
  const trashedQuiz = findTrashedQuizById(quizId);

  if (trashedQuiz !== undefined) {
    if (trashedQuiz.quiz.authUserId !== authUserId) {
      throw new Error('User is not an owner of this quiz.');
    }
  }
}

/**
 * Function checks if all quizzes in the given list that are in the trash belong to a given current user
 *
 * @param {number} authUserId
 * @param {number[]} quizIds
 * @returns {{}}
 */
export function trashedQuizzesBelongToUser(authUserId: number, quizIds: number[]): EmptyObject {
  for (const quizId of quizIds) {
    const trashedQuiz = findTrashedQuizById(quizId);
    if (trashedQuiz === undefined) {
      return {};
    } else if (trashedQuiz.quiz.authUserId !== authUserId) {
      throw new Error('One or more Quiz IDs refer to a quiz that this current user does not own.');
    }
  }
  return {};
}

/**
 * Function checks if a quiz exists in either trash or quizzes
 *
 * @param {number} quizId
 * @returns {void}
 */
export function quizDoesNotExist(quizId: number): void {
  const trashedQuiz = findTrashedQuizById(quizId);
  if (trashedQuiz === undefined) {
    const quiz = findQuizById(quizId);
    if (quiz === undefined) {
      throw new Error('Quiz does not exist.');
    }
  }
}

/**
 * Function checks if all quiz IDs in the given list exist in either trash or quizzes
 *
 * @param {number[]} quizIds
 * @returns {{}}
 */
export function quizzesDoNotExist(quizIds: number[]): EmptyObject {
  for (const quizId of quizIds) {
    const trashedQuiz = findTrashedQuizById(quizId);
    const quiz = findQuizById(quizId);

    if (trashedQuiz === undefined && quiz === undefined) {
      throw new Error('One or more Quiz IDs do not exist');
    }
  }
  return {};
}

/**
 * Function takes an authUserId (returned when a user registers or logs in),
 * creates a new token which contains the sessionId and authUserId and
 * adds it to dataStore.
 *
 * @param {number} authUserId
 * @returns {Tokens}
 */
export function tokenCreate(authUserId: number): Tokens {
  let newSessionId = getRandomInt();
  while (sessionIdExists(newSessionId)) {
    newSessionId = getRandomInt();
  }

  const newToken = {
    sessionId: newSessionId,
    authUserId: authUserId
  };

  const data = getData();
  data.tokens.push(newToken);
  setData(data);

  return newToken;
}

/**
 * Function takes sessionId and quizId and first checks token/sessionId errors.
 * If no errors, obtaining token and checking if quizId and authUserId match
 * If no errors, returning valid token.
 *
 * @param {number} sessionId
 * @param {number} quizId
 * @returns {Response}
 */
export function quizRoutesErrorChecking(sessionId: number, quizId: number): Response {
  try {
    tokenExists(sessionId);
  } catch (error) {
    return { error: error.message, code: 401 };
  }

  const userToken = findTokenFromSessionId(sessionId);

  try {
    quizBelongsToUser(userToken.authUserId, quizId);
  } catch (error) {
    return { error: error.message, code: 403 };
  }

  return { userToken: userToken };
}
