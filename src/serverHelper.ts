import { Tokens, getData, setData } from './dataStore';

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
