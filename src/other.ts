// includes other functions (clear)

import { setData, EmptyObject, Data } from './dataStore';

/**
 * Reset the state of the application back to the start.
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

  setData(newData);

  return {};
}
