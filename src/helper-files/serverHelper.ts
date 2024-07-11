import { ErrorObject, EmptyObject, Tokens, getData, setData } from '../dataStore';
import { findQuizById, findTrashedQuizById } from './helper';

/**
 * Function checks if a sessionId already exists in the dataStore
 *
 * @param {number} sessionId
 * @returns {boolean} true if sessionId is valid otherwise false
 */
export function sessionIdExists(sessionId: number): boolean {
  const data = getData();

  const token = data.tokens.find(token => token.sessionId === sessionId);

  if (token === undefined) {
    return false;
  } else {
    return true;
  }
}

/**
 * Function checks if a token with a matching sessionId exists in the dataStore
 * and checks that the token's authUserId is in the dataStore
 *
 * @param {number} sessionId
 * @returns {{} | { error: string }}
 */
export function tokenExists(sessionId: number): EmptyObject | ErrorObject {
  const data = getData();

  const foundToken = data.tokens.find(token => token.sessionId === sessionId);

  if (foundToken === undefined) {
    return { error: 'Invalid session ID.' };
  } else {
    const foundAuthUserId = data.users.find(users => users.authUserId === foundToken.authUserId);
    if (foundAuthUserId === undefined) {
      return { error: 'Invalid session ID.' };
    } else {
      return {};
    }
  }
}

/**
 * Function checks if a sessionId exists and returns the entire token object or
 * an error
 *
 * @param {number} sessionId
 * @returns {{} | { error: string }}
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
 * @returns {{} | { error: string }}
 */
export function quizBelongsToUser(authUserId: number, quizId: number): EmptyObject | ErrorObject {
  const quiz = findQuizById(quizId);

  if (quiz === undefined || quiz.authUserId !== authUserId) {
    return { error: 'User is not an owner of this quiz' };
  } else {
    return {};
  }
}
/**
 * Function checks if all quizzes in the given list belong to a given current user
 *
 * @param {number} authUserId
 * @param {number[]} quizIds
 * @returns {{} | { error: string }}
 */
export function quizzesBelongToUser(authUserId: number, quizIds: number[]): EmptyObject | ErrorObject {
  for (const quizId of quizIds) {  // for loop
    const quiz = findQuizById(quizId);
    if (quiz === undefined || quiz.authUserId !== authUserId) {
      return { error: 'One or more Quiz IDs refer to a quiz that this current user does not own.' };

    }
  }
}

/*
 * Function checks if a quiz in the trash belongs to a given current user
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {{} | { error: string }}
 */
export function trashedQuizBelongsToUser(authUserId: number, quizId: number): EmptyObject | ErrorObject {
  const trashedQuiz = findTrashedQuizById(quizId);

  if (trashedQuiz === undefined) {
    return {};
  } else if (trashedQuiz.quiz.authUserId !== authUserId) {
    return { error: 'User is not an owner of this quiz' };
  } return {};
}

/**
 * Function checks if a quiz exists in either trash or quizzes
 *
 * @param {number} quizId
 * @returns {{} | { error: string }}
 */
export function quizDoesNotExist(quizId: number): EmptyObject | ErrorObject {
  const trashedQuiz = findTrashedQuizById(quizId);
  if (trashedQuiz === undefined) {
    const quiz = findQuizById(quizId);
    if (quiz === undefined) {
      return { error: 'Quiz does not exist' };
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
  let newSessionId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  while (sessionIdExists(newSessionId)) {
    newSessionId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
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
