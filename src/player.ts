// includes player functions

import { setData, getData, Message, EmptyObject } from './dataStore';
import { 
  findQuizSessionById, 
  generateRandomName, 
  getRandomInt, 
  playerIdInUse, 
  playerNameExists, 
  updateSessionStateIfAutoStart, 
  findSessionByPlayerId,
  findPlayerNameByPlayerId,
  currentTime,
} from './helper-files/helper';
import { QuizSessionState } from './quiz';

interface SendMessage {
  message: {
    messageBody: string;
  }
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
 * Allow a player to send a message during a session
 *
 * @param {number} playerId
 * @param {Message} message
 * @returns {{}}
 */
export function playerSendChat(playerId: number, sendMessage: SendMessage): EmptyObject {
  if (!playerIdInUse(playerId)) {
    throw new Error('The player ID does not exist');
  }

  const session = findSessionByPlayerId(playerId);
  
  if (sendMessage.message.messageBody.length < 1 || sendMessage.message.messageBody.length > 100) {
    throw new Error('The message body is less than 1 character or more than 100 characters');
  }

  const newMessage = {
    messageBody: sendMessage.message.messageBody,
    playerId: playerId,
    playerName: findPlayerNameByPlayerId(playerId),
    timeSent: currentTime(),
  }

  session.messages.push(newMessage);
  return {};
}