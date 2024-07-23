// includes player functions

import { setData, getData, ErrorObject, EmptyObject, Question, Answer, QuizSessions, Player } from './dataStore';
import { generateRandomName, playerIdInUse, findQuizSessionById } from './helper-files/helper';

// =============================== FUNCTIONS ================================ //
/**
 * Allow a guest player to join a session
 *
 * @param {number} sessionId
 * @param {string} name
 * @returns {{ playerId: number}}
 */
export function playerJoin (sessionId: number, name: string): {playerId: number} {
  let playerName = name; 

  if (playerName === '') {
      playerName = generateRandomName();
    }

  const data = getData();
  const nameExists = data.players.find(q => q.name === name);
  /*
  for (const player of data.quizzes) {
    if (player.name === name) {
      return true;
    }
  }
  */
  if (nameExists) {
    throw new Error('Name is not unique');
  }

  if (findQuizSessionById === undefined) {
    throw new Error('Session Id does not refer to a valid session')
  }

  // if session is not in lobby state 

  let newPlayerId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  while (playerIdInUse(newPlayerId) === true) { 
  newPlayerId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  const newPlayer = {
    playerId: newPlayerId,
    name: name, 
  };

  data.players.push(newPlayer);
  setData(data);

  return { playerId: newPlayerId };

}