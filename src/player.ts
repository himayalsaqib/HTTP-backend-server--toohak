// includes player functions

import { setData, getData, EmptyObject, Message, UsersRanking, PlayerAnswered, QuestionResults} from './dataStore';
import { currentTime, getRandomInt } from './helper-files/authHelper';
import {
  findNameByPlayerId,
  findSessionByPlayerId,
  generateRandomName,
  playerIdInUse,
  playerNameExists
} from './helper-files/playerHelper';
import { beginQuestionCountdown, findQuizSessionById } from './helper-files/quizHelper';
import { QuizSessionState } from './quiz';

interface SendMessage {
  messageBody: string
}

export interface playerStatus {
  state: string;
  numQuestions: number;
  atQuestion: number;
}

interface FinalResults {
  usersRankedByScore: UsersRanking[];
  questionResults: QuestionResults[];
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

  // Initialise ranking field
  const newPlayerRank: UsersRanking = {
    playerId: newPlayerId,
    name: playerName,
    score: 0
  };
  session.usersRankedByScore.push(newPlayerRank);

  // Update the session state if the number of players matches the autoStartNum
  if (session.players.length === session.autoStartNum) {
    beginQuestionCountdown(session, session.sessionId);
  }

  setData(data);

  return { playerId: newPlayerId };
}

/**
 * Get the status of a guest player that has already joined a session
 * @param {number} playerId
 * @returns {playerStatus} - returns status of player
 */
export function getPlayerStatus (playerId: number): playerStatus {
  if (!playerIdInUse(playerId)) {
    throw new Error('The player ID does not exist');
  }

  const session = findSessionByPlayerId(playerId);

  const status = {
    state: session.state,
    numQuestions: session.quiz.numQuestions,
    atQuestion: session.atQuestion
  };

  return status;
}

/**
 * Allows the player to submit answer/s to a question.
 *
 * @param {number} playerId
 * @param {number} questionPosition
 * @param {{ answerIds: number[] }}
 * @returns {{}}
 */
export function playerSubmitAnswer(playerId: number, questionPosition: number, body: { answerIds: number[] }): EmptyObject {
  const data = getData();
  if (!playerIdInUse(playerId)) {
    throw new Error('Player id does not exist');
  }

  const session = findSessionByPlayerId(playerId);

  // Check if the question position is valid for the session the player is in
  if (questionPosition < 1 || questionPosition > session.quiz.numQuestions) {
    throw new Error('Invalid question position');
  }
  // Check if session state is QUESTION_OPEN
  if (session.state !== QuizSessionState.QUESTION_OPEN) {
    throw new Error('Session is not in QUESTION_OPEN state');
  }

  // Checking session is currently on this question
  if (session.atQuestion !== questionPosition) {
    throw new Error('Session is not currently on this question');
  }

  const { answerIds } = body;
  const question = session.quiz.questions[questionPosition - 1];

  const validAnswerIds = new Set(
    question.answers.map((answer: { answerId: number }) => answer.answerId)
  );

  const invalidAnswerIds = answerIds.filter((id) => !validAnswerIds.has(id));
  if (invalidAnswerIds.length > 0) {
    throw new Error('Invalid answer ids provided');
  }

  // Check for duplicate answer ids
  const uniqueAnswerIds = new Set(answerIds);
  if (uniqueAnswerIds.size !== answerIds.length) {
    throw new Error('Duplicate answer ids provided');
  }

  // Throw error is less than 1 answer id submitted
  if (answerIds.length < 1) {
    throw new Error('Less than 1 answer id submitted');
  }

  const playerIndex = session.players.findIndex((player) => player.playerId === playerId);
  if (playerIndex === -1) {
    throw new Error('Player not found in session');
  }

  const answerTime = currentTime();
  const timeTaken = answerTime - (session.questionOpenTime || 0);

  // Filter player answer ids to check for correct answers
  const correctAnswers = answerIds.filter((id) => validAnswerIds.has(id));
  const isCorrect = correctAnswers.length === validAnswerIds.size;

  // Calculate score
  const score = isCorrect ? question.points : 0;

  const questionResults = session.questionResults[questionPosition - 1];
  if (questionResults) {
    const playerAnswered: PlayerAnswered = {
      playerId: playerId,
      answerTime: timeTaken,
      correctAnswer: isCorrect,
      score: score,
    };
    questionResults.playersAnsweredList.push(playerAnswered);
  }
  setData(data);

  return {};
}

/**
 * Allows the player to submit answer/s to a question.
 *
 * @param {number} playerId
 * @returns {{ FinalResults }}
 */
export function playerResults(playerId: number): FinalResults {
  if (!playerIdInUse(playerId)) {
    throw new Error('Player ID does not exist');
  }

  const session = findSessionByPlayerId(playerId);
  if (session.state !== QuizSessionState.FINAL_RESULTS) {
    throw new Error('Session is not in FINAL_RESULTS state');
  }

  const finalResults: FinalResults = {
    usersRankedByScore: session.usersRankedByScore,
    questionResults: session.questionResults
  }
  console.log(finalResults);

  return finalResults;
}

/**
 * Allow a player to send a message during a session
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
