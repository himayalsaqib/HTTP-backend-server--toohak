// includes player functions

import { setData, getData, EmptyObject, Message, UsersRanking, PlayerAnswered } from './dataStore';
import { currentTime, getRandomInt } from './helper-files/authHelper';
import {
  findNameByPlayerId,
  findSessionByPlayerId,
  generateRandomName,
  playerIdInUse,
  playerNameExists
} from './helper-files/playerHelper';
import { beginQuestionCountdown, findQuizSessionById } from './helper-files/quizHelper';
import { QuizSessionState, QuizAnswerColours } from './quiz';

// ============================ TYPE ANNOTATIONS ============================ //

interface SendMessage {
  messageBody: string
}

export interface playerStatus {
  state: string;
  numQuestions: number;
  atQuestion: number;
}

interface PlayerQuestionResults {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface QuestionDisplay {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl: string;
  points: number;
  answers: {
    answerId: number;
    answer: string;
    colour: QuizAnswerColours;
  }[];
}

interface SimplifiedUsersRanking {
  name: string;
  score: number;
}

interface FinalResults {
  usersRankedByScore: SimplifiedUsersRanking[];
  questionResults: PlayerQuestionResults[];
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
 *
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
 * Get the information about a question that the guest player is on.
 * @param {number} playerId
 * @param {number} questionPosition
 * @returns {{ QuestionDisplay } } - returns question information
 */
export function playerQuestionInformation(playerId: number, questionPosition: number): QuestionDisplay {
  if (!playerIdInUse(playerId)) {
    throw new Error('Player ID does not exist');
  }
  const session = findSessionByPlayerId(playerId);

  const invalidStates = [
    QuizSessionState.LOBBY,
    QuizSessionState.QUESTION_COUNTDOWN,
    QuizSessionState.FINAL_RESULTS,
    QuizSessionState.END,
  ];

  if (invalidStates.includes(session.state)) {
    throw new Error('Session is in LOBBY, QUESTION_COUNTDOWN, FINAL_RESULTS or END state');
  }
  if (questionPosition < 1 || questionPosition > session.quiz.numQuestions) {
    throw new Error('Question position is not valid for the session this player is in');
  }
  if (questionPosition !== session.atQuestion) {
    throw new Error('Session is not currently on this question');
  }

  const question = session.quiz.questions[questionPosition - 1];

  // Produce new answers array without property correct
  const answersDisplay = question.answers.map(({ answerId, answer, colour }) => ({
    answerId,
    answer,
    colour,
  }));

  return {
    questionId: question.questionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: answersDisplay,
  };
}

/**
 * Allows the player to submit answer/s to a question.
 *
 * @param {number} playerId
 * @param {number} questionPosition
 * @param {{ answerIds: number[] }} body
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

  session.players.findIndex((player) => player.playerId === playerId);

  const answerTime = currentTime();
  const timeTaken = answerTime - (session.questionOpenTime || 0);

  // Find correct answer ids in the question
  const correctAnswerIds = question.answers.flatMap(
    answer => answer.correct ? answer.answerId : []
  );

  // Filter player answer ids to check for correct answers
  const correctAnswers = answerIds.filter((id) => correctAnswerIds.includes(id));
  const isCorrect = correctAnswers.length === correctAnswerIds.length;

  const questionResults = session.questionResults[questionPosition - 1];

  // Remove previous submission if player resubmits
  const existingAnswerIndex = questionResults.playersAnsweredList.findIndex(
    (answered) => answered.playerId === playerId
  );

  if (existingAnswerIndex !== -1) {
    questionResults.playersAnsweredList.splice(existingAnswerIndex, 1);
  }

  const correctIndex = questionResults.playersCorrectList.indexOf(
    findNameByPlayerId(playerId)
  );
  if (correctIndex !== -1) {
    questionResults.playersCorrectList.splice(correctIndex, 1);
  }

  // if player is correct add their name to playersCorrectList
  if (isCorrect) {
    questionResults.playersCorrectList.push(findNameByPlayerId(playerId));
  }

  // Calculate score based on player's position in playersCorrectList
  const userRank = questionResults.playersCorrectList.length;
  const score = isCorrect ? Math.round(question.points / userRank) : 0;

  const playerAnswered: PlayerAnswered = {
    playerId: playerId,
    answerTime: timeTaken,
    score: score,
  };

  questionResults.playersAnsweredList.push(playerAnswered);

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

  const usersRankedByScore = session.usersRankedByScore.map(({ name, score }) => ({ name, score }));

  const questionResults: PlayerQuestionResults[] = session.questionResults.map(result => ({
    questionId: result.questionId,
    playersCorrectList: result.playersCorrectList.sort(),
    averageAnswerTime: result.averageAnswerTime,
    percentCorrect: result.percentCorrect
  }));

  const finalResults: FinalResults = {
    usersRankedByScore,
    questionResults
  };

  return finalResults;
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
  if (!playerIdInUse(playerId)) {
    throw new Error('Player id does not exist');
  }

  const session = findSessionByPlayerId(playerId);

  if (questionPosition < 1 || questionPosition > session.quiz.numQuestions) {
    throw new Error('Question position is not valid for the session this player is in');
  }
  if (session.state !== QuizSessionState.ANSWER_SHOW) {
    throw new Error('Session is not in ANSWER_SHOW state.');
  }
  if (session.atQuestion !== questionPosition) {
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
