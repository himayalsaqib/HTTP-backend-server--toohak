// includes player functions

import { setData, getData } from './dataStore';
import { generateRandomName, playerIdInUse, playerNameExists } from './helper-files/helper';
import { QuizSessionState } from './quiz';

// =============================== FUNCTIONS ================================ //
/**
 * Allow a guest player to join a session
 *
 * @param {number} sessionId
 * @param {string} name
 * @returns {{ playerId: number}}
 */
export function playerJoin(sessionId: number, name: string): { playerId: number } {
  let playerName = name;

  if (playerName === '') {
    playerName = generateRandomName();
    while (playerNameExists(playerName)) {
      playerName = generateRandomName();
    }
  }

  const data = getData();

  if (playerNameExists(playerName)) {
    throw new Error('Name is not unique');
  }
  const session = data.quizSessions.find((session) => session.sessionId === sessionId);
  if (!session) {
    throw new Error('Session Id does not refer to a valid session');
  }

  // throw error for if session is not in lobby state
  if (session.state !== QuizSessionState.LOBBY) {
    throw new Error('Session is not in LOBBY state');
  }

  let newPlayerId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  while (playerIdInUse(newPlayerId)) {
    newPlayerId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  const newPlayer = {
    playerId: newPlayerId,
    name: playerName,
  };

  data.players.push(newPlayer);

  setData(data);

  return { playerId: newPlayerId };
}
