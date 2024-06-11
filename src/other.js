import { getData, setData } from './dataStore';

/**
 * Reset the state of the application back to the start.
 * @param {} - no parameters
 * @returns {object} - empty object
 */
export function clear () {
  
  setData({
    users: [],
    quizzes: []
  });

  // let data = getData();
  // data.users = [];
  // data.quizzes = [];
  
  return {};
}