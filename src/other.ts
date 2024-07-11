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
    trash: [],
    tokens: []
  };

  setData(newData);

  return {};
}
