import { getData } from './dataStore';

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