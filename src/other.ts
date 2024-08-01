// includes other functions (clear)

import { setData, EmptyObject, Data } from './dataStore';
import { sessionIdToTimerArray } from './quiz';

/**
 * Reset the state of the application back to the start.
 * 
 * @returns {EmptyObject} - empty object
 */
export function clear(): EmptyObject {
  const newData: Data = {
    users: [],
    quizzes: [],
    quizSessions: [],
    trash: [],
    tokens: [],
    players: [],
  };

  for (const id in sessionIdToTimerArray) {
    clearTimeout(sessionIdToTimerArray[id].timeoutId);
  }

  setData(newData);

  return {};
}
