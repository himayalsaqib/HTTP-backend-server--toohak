// includes player functions

import { setData, getData, EmptyObject, Message } from './dataStore';
import {
  findQuizSessionById,
  generateRandomName,
  getRandomInt,
  playerIdInUse,
  playerNameExists,
  updateSessionStateIfAutoStart,
  findSessionByPlayerId,
  findNameByPlayerId,
  currentTime,
} from './helper-files/helper';
import { QuizSessionState } from './quiz';

interface SendMessage {
  messageBody: string
}

export interface playerStatus {
  state: string;
  numQuestions: number;
  atQuestion: number;
}

// =============================== FUNCTIONS ================================ //
/**
 * Allow a guest player to join a session
 *
 * @param {number} sessionId
 * @param {string} name
 * @returns {{ playerId: number }}
 */
export function playerJoin(sessionId: number, name: string): { playerId: number } {
  const session = findQuizSessionById(sessionId);
  if (!session) {
    throw new Error('Session Id does not refer to a valid session');
  }

  let playerName = name;

  if (playerName === '') {
    playerName = generateRandomName();
    while (playerNameExists(sessionId, playerName)) {
      playerName = generateRandomName();
    }
  }

  const data = getData();
  if (playerNameExists(sessionId, playerName)) {
    throw new Error('Name is not unique');
  }

  // throw error for if session is not in lobby state
  if (session.state !== QuizSessionState.LOBBY) {
    throw new Error('Session is not in LOBBY state');
  }

  let newPlayerId = getRandomInt();
  while (playerIdInUse(newPlayerId)) {
    newPlayerId = getRandomInt();
  }

  const newPlayer = { playerId: newPlayerId, name: playerName };
  session.players.push(newPlayer);
  data.players.push(newPlayer);

  // Update the session state if the number of players matches the autoStartNum
  updateSessionStateIfAutoStart(session);

  setData(data);

  return { playerId: newPlayerId };
}

/**
 * Get the status of a guest player that has already joined a session
 * @param {number} playerId
 * @param {number} sessionId
 * @returns {playerStatus} - returns status of player
 */
export function getPlayerStatus (playerId: number, sessionId: number): playerStatus {
  if (!playerIdInUse(playerId)) {
    throw new Error('The player ID does not exist');
  }

  const session = findSessionByPlayerId(playerId);
  if (!session) {
    throw new Error('Session Id does not refer to a valid session');
  }

  // Check if the player is in the session
  const playerInSession = session.players.some(player => player.playerId === playerId);
  if (!playerInSession) {
    throw new Error('The player Id does not belong to this session');
  }

  const status: playerStatus = {
    state: session.state,
    numQuestions: session.quiz.numQuestions,
    atQuestion: session.atQuestion
  };

  return status;
}

/**
 * Allow a player to send a message during a session
 *
 * @param {number} playerId
 * @param {Message} message
 * @returns {{}}
 */
export function playerSendChat(playerId: number, message: SendMessage): EmptyObject {
  if (!playerIdInUse(playerId)) {
    throw new Error('The player ID does not exist');
  }

  const session = findSessionByPlayerId(playerId);

  if (message.messageBody.length < 1 || message.messageBody.length > 100) {
    throw new Error('The message body is less than 1 character or more than 100 characters');
  }

  const newMessage = {
    messageBody: message.messageBody,
    playerId: playerId,
    playerName: findNameByPlayerId(playerId),
    timeSent: currentTime(),
  };

  session.messages.push(newMessage);
  return {};
}

/**
 * Displays all messages sent in a session
 *
 * @param {number} playerId
 * @returns {{ messages: Message[] }}
 */
export function playerViewChat(playerId: number): { messages: Message[] } {
  if (!playerIdInUse(playerId)) {
    throw new Error('The player ID does not exist');
  }

  const session = findSessionByPlayerId(playerId);

  return { messages: session.messages };
}
