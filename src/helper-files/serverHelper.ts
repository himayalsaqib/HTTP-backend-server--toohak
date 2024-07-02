import { ErrorObject, EmptyObject, Tokens, getData, setData } from '../dataStore';

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

  const foundToken = data.tokens.find(foundToken => foundToken.sessionId === token.sessionId);

  if (foundToken === undefined || foundToken.authUserId !== token.authUserId) {
    return { error: 'Token does not refer to a valid logged in user session' };
  } else {
    return {};
  }
}

/**
 * Function checks if a quiz belongs to a given current user
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {{} | { error: string }}
 */
export function quizBelongsToUser(authUserId: number, quizId: number): EmptyObject | ErrorObject {
  const data = getData();

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);

  if (quiz === undefined || quiz.authUserId !== authUserId) {
    return { error: 'User is not an owner of this quiz' };
  } else {
    return {};
  }
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
