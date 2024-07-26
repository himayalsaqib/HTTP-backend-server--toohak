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

// ============================ TYPE ANNOTATIONS ============================ //

interface SendMessage {
  messageBody: string
}

interface PlayerQuestionResults {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
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
    throw new Error('Session Id does not refer to a valid session.');
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
    throw new Error('Name is not unique.');
  }

  // throw error for if session is not in lobby state
  if (session.state !== QuizSessionState.LOBBY) {
    throw new Error('Session is not in LOBBY state.');
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
export function playerSendChat(playerId: number, message: SendMessage): EmptyObject {
  if (!playerIdInUse(playerId)) {
    throw new Error('The player ID does not exist.');
  }

  const session = findSessionByPlayerId(playerId);

  if (message.messageBody.length < 1 || message.messageBody.length > 100) {
    throw new Error('The message body is less than 1 character or more than 100 characters.');
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
    throw new Error('The player ID does not exist.');
  }

  const session = findSessionByPlayerId(playerId);

  return { messages: session.messages };
}

export function playerQuestionResults(playerId: number, questionPosition: number): PlayerQuestionResults {
  const session = findSessionByPlayerId(playerId);

  if (!playerIdInUse(playerId)) {
    throw new Error('The player ID does not exist.');
  }
  if (questionPosition > session.quiz.questions.length) {
    throw new Error('Question position is not valid for the session this player is in.');
  }
  if (session.state != QuizSessionState.ANSWER_SHOW) {
    throw new Error('Session is not in ANSWER_SHOW state.');
  }
  if (session.atQuestion != questionPosition) {
    throw new Error('Session is not currently on this question.');
  }

  const currentQuestion = session.questionResults[questionPosition - 1];

  return {
    questionId: currentQuestion.questionId,
    playersCorrectList: currentQuestion.playersCorrectList.sort(),
    averageAnswerTime: currentQuestion.averageAnswerTime,
    percentCorrect: currentQuestion.percentCorrect,
  };
}
