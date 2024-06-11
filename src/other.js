import { getData } from './dataStore';

/**
 * Reset the state of the application back to the start.
 * @param {} - no parameters
 * @returns {object} - empty object
 */
export function clear () {
  let data = getData();

  data.users = [];
  data.quizzes = [];

  return {};
}