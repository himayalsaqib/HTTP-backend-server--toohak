// includes player functions

import { setData, getData, ErrorObject, EmptyObject, Question, Answer, QuizSessions, Player } from './dataStore';
import { generateRandomName, playerIdInUse, findQuizSessionById } from './helper-files/helper';

export enum QuizSessionState {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

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
  const nameExists = data.players.find(q => q.name === playerName);


  if (nameExists) {
   throw new Error('Name is not unique');
  }
  const session = data.quizSessions.find((session) => session.sessionId === sessionId);
  if (!session) {
    throw new Error('Session Id does not refer to a valid session')
  }

  // throw error for if session is not in lobby state 
  if (session.state !== QuizSessionState.LOBBY) {
    throw new Error('Session is not in LOBBY state');
  }

  let newPlayerId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  while (playerIdInUse(newPlayerId) === true) { 
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

