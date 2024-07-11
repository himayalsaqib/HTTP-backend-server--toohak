import { ErrorObject, EmptyObject, Tokens, getData, setData } from '../dataStore';
import { findQuizById, findTrashedQuizById } from './helper';


/**
 * Function to handle response formatting
 *
 * @param result
 * @param res
 */
export function handleResponse(result: EmptyObject | ErrorObject & { code?: number }, res: any) {
  if ('error' in result) {
    res.status(result.code).json({ error: result.error });
  } else {
    res.json(result);
  }
}

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
 * Function checks if a token with a matching sessionId and authUserId exists
 * in the dataStore
 *
 * @param {Tokens} token
 * @returns {{} | { error: string }}
 */
export function tokenExists(token: Tokens): EmptyObject | ErrorObject {
  const data = getData();
  // const decodedToken: Tokens = JSON.parse(decodeURIComponent(token));

  const foundToken = data.tokens.find(foundToken => foundToken.sessionId === token.sessionId);
  // const foundToken = data.tokens.find(foundToken => foundToken.sessionId === decodedToken.sessionId);

  // if (foundToken === undefined || foundToken.authUserId !== decodedToken.authUserId) {

  if (foundToken === undefined || foundToken.authUserId !== token.authUserId) {
    return { error: 'Token does not refer to a valid logged in user session' };
  } else {
    return {};
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
 * Function checks if all quizzes in the given list that are in the trash belong to a given current user
 *
 * @param {number} authUserId
 * @param {number[]} quizIds
 * @returns {{} | { error: string }}
 */
export function trashedQuizzesBelongToUser(authUserId: number, quizIds: number[]): EmptyObject | ErrorObject {
  for (const quizId of quizIds) {
    const trashedQuiz = findTrashedQuizById(quizId);
    if (trashedQuiz === undefined) {
      return {};
    } else if (trashedQuiz.quiz.authUserId !== authUserId) {
      return { error: 'One or more Quiz IDs refer to a quiz that this current user does not own.' };
    }
  }
  return {};
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
 * Function checks if all quiz IDs in the given list exist in either trash or quizzes
 *
 * @param {number[]} quizIds
 * @returns {{} | { error: string }}
 */
export function quizzesDoNotExist(quizIds: number[]): EmptyObject | ErrorObject {
  for (const quizId of quizIds) {
    const trashedQuiz = findTrashedQuizById(quizId);
    const quiz = findQuizById(quizId);

    if (trashedQuiz === undefined && quiz === undefined) {
      return { error: 'One or more Quiz IDs do not exist' };
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
  // return { token: encodeURIComponent(JSON.stringify(newToken)) };
  return newToken;
}
