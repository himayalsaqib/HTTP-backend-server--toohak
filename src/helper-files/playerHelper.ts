// ======================== PLAYER HELPER FUNCTIONS ========================= //

import { getData, QuizSessions } from '../dataStore';
import { findQuizSessionById } from './quizHelper';

/**
 * Function generates a random name if player name is empty string
 *
 * @param {}
 * @returns {string} random name
 */
export function generateRandomName(): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  let name = '';

  // Generate 5 unique letters
  while (name.length < 5) {
    const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
    if (!name.includes(randomLetter)) {
      name += randomLetter;
    }
  }

  // Generate 3 unique numbers
  while (name.length < 8) {
    const randomNumber = numbers.charAt(Math.floor(Math.random() * numbers.length));
    if (!name.includes(randomNumber)) {
      name += randomNumber;
    }
  }

  return name;
}

/**
 * Function checks if a player name already exists in the session
 *
 * @param {number} sessionId
 * @param {string} playerName
 * @returns {boolean} true if player name has been used, false if it has not
 */
export function playerNameExists(sessionId: number, playerName: string): boolean {
  const session = findQuizSessionById(sessionId);
  return session.players.some(player => player.name === playerName);
}

/**
 * Function checks if a player ID has already been used by another player
 *
 * @param {Number} playerId
 * @returns {boolean} true if player ID has been used, false if it has not
 */
export function playerIdInUse(playerId: number): boolean {
  const data = getData();
  return data.players.some(player => player.playerId === playerId);
}

/**
 * Function returns the session the given player is in
 *
 * @param {number} playerId
 * @returns {QuizSessions | undefined} sessionId | undefined if session does not exist
 */
export function findSessionByPlayerId(playerId: number): QuizSessions | undefined {
  const data = getData();
  const session = data.quizSessions.find(q =>
    q.players.some(player => player.playerId === playerId) === true);

  return session;
}

/**
 * Function returns the name corresponding to a given player ID
 *
 * @param {number} playerId
 * @returns {string | undefined} name | undefined if player does not exist
 */
export function findNameByPlayerId(playerId: number): string | undefined {
  const data = getData();
  const player = data.players.find(player => player.playerId === playerId);
  return player?.name;
}
