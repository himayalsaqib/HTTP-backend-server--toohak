// includes quiz functions

import { setData, getData, EmptyObject, Question, Answer, Quizzes, PlayerAnswered } from './dataStore';
import { adminEmailInUse, currentTime, findUserByEmail, getRandomInt } from './helper-files/authHelper';
import { stringify } from 'csv-stringify/sync';
import fs from 'fs';
import {
  beginQuestionCountdown,
  calculateSumQuestionDuration,
  cancelTimer,
  changeQuestionOpenToQuestionClose,
  checkAnswerLength,
  checkForAnsDuplicates,
  checkForNumCorrectAns,
  checkThumbnailUrlFileType,
  correctSessionStateForAction,
  createAnswersArray,
  endOfQuestionUpdates,
  findQuestionById,
  findQuizById,
  findQuizSessionById,
  findTrashedQuizById,
  initialiseQuestionResults,
  questionIdInUse,
  quizIdInUse,
  quizIsInTrash,
  quizNameHasValidChars,
  quizNameInUse,
  swapQuestions,
  generatePlayerData
} from './helper-files/quizHelper';
import path from 'path';

// ============================= GLOBAL VARIABLES =========================== //
const MIN_QUIZ_NAME_LEN = 3;
const MAX_QUIZ_NAME_LEN = 30;
const MAX_DESCRIPTION_LEN = 100;

const MIN_QUESTION_INDEX = 0;
const MIN_QUESTION_LEN = 5;
const MAX_QUESTION_LEN = 50;

const MIN_NUM_ANSWERS = 2;
const MAX_NUM_ANSWERS = 6;

const MAX_QUIZ_QUESTIONS_DURATION = 180;
const MIN_QUIZ_QUESTIONS_DURATION = 0;

const MIN_POINT_VALUE = 1;
const MAX_POINT_VALUE = 10;

const MIN_ANS_LEN = 1;
const MAX_ANS_LEN = 30;

const MIN_CORRECT_ANS = 1;

const MAX_AUTO_START_NUM = 50;

const MAX_ACTIVE_QUIZ_SESSIONS = 10;

export const WAIT_THREE_SECONDS = 3;

export const sessionIdToTimerArray: { sessionId: number, timeoutId: ReturnType<typeof setTimeout> }[] = [];

// ============================ TYPE ANNOTATIONS ============================ //
export interface QuizList {
  quizId: number;
  name: string;
}

// excludes authUserId, active sessions and inactive sessions from Quizzes interface
export interface QuizInfo {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
  thumbnailUrl?: string;
}

export interface QuizQuestionAnswers {
  answer: string;
  correct: boolean;
}

export interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: QuizQuestionAnswers[];
  thumbnailUrl?: string;
}

export interface QuizSessionStatus {
  state: QuizSessionState;
  atQuestion: number;
  players: string[];
  metadata: QuizInfo;
}

export interface QuizSessionsView {
  activeSessions: number[];
  inactiveSessions: number[];
}

export interface PlayerResultsData {
  name: string;
  [playerInfo: string]: number | string;
}

interface QuizSessionResultsCSV {
  url: string;
}

interface UsersRankedByScore {
  name: string;
  score: number;
}

interface QuestionResults {
  questionId: number;
  playersCorrectList: string[];
  playersAnsweredList: PlayerAnswered[];
  averageAnswerTime: number;
  percentCorrect: number;
}

interface SessionFinalResults {
  usersRankedByScore: UsersRankedByScore[];
  questionResults: QuestionResults[];
}
// ================================= ENUMS ================================== //

export enum QuizAnswerColours {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  BROWN = 'brown',
  ORANGE = 'orange',
}

export enum QuizSessionState {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

export enum QuizSessionAction {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}

// =============================== FUNCTIONS ================================ //

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {number} authUserId
 * @returns {{ quizzes: { quizList }[] }}
 */
export function adminQuizList(authUserId: number): { quizzes: QuizList[] } {
  const data = getData();
  const quizList = [];

  for (const quiz of data.quizzes) {
    if (quiz.authUserId === authUserId) {
      quizList.push({
        quizId: quiz.quizId,
        name: quiz.name,
      });
    }
  }

  return { quizzes: quizList };
}

/**
 * Given basic details about a new quiz, create one for the logged in user
 *
 * @param {number} authUserId
 * @param {string} name
 * @param {string} description
 * @returns {{ quizId: number }} - assigns a quizId | error
 */
export function adminQuizCreate(authUserId: number, name: string, description: string): { quizId: number } {
  if (quizNameHasValidChars(name) === false) {
    throw new Error('Name contains invalid characters. Valid characters are alphanumeric and spaces.');
  }
  if (name.length < MIN_QUIZ_NAME_LEN || name.length > MAX_QUIZ_NAME_LEN) {
    throw new Error('Name is either less than 3 characters long or more than 30 characters long.');
  }
  if (quizNameInUse(authUserId, name) === true) {
    throw new Error('Name is already used by the current logged in user for another quiz.');
  }
  if (description.length > MAX_DESCRIPTION_LEN) {
    throw new Error('Description is more than 100 characters in length.');
  }

  const data = getData();
  let newQuizId = getRandomInt();
  while (quizIdInUse(newQuizId) === true) {
    newQuizId = getRandomInt();
  }

  const newQuiz: Quizzes = {
    authUserId: authUserId,
    quizId: newQuizId,
    name: name,
    timeCreated: currentTime(),
    timeLastEdited: currentTime(),
    description: description,
    questions: [],
    duration: 0,
    activeSessions: [],
    inactiveSessions: [],
  };

  data.quizzes.push(newQuiz);
  setData(data);

  return { quizId: newQuizId };
}

/**
 * Given a particular quiz, move quiz to trash
 *
 * @param {number} quizId
 * @returns {{}} - an empty object
 */
export function adminQuizRemove (quizId: number): EmptyObject {
  const data = getData();
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const quiz = data.quizzes[quizIndex];
  // check all sessions for this quiz for being in the END state
  if (quiz.activeSessions.length !== 0) {
    throw new Error('Any session for this quiz is not in END state.');
  }

  quiz.timeLastEdited = currentTime();
  data.trash.push({ quiz: quiz });
  data.quizzes.splice(quizIndex, 1);
  setData(data);

  return {};
}

/**
 * Get all of the relevant information about the current quiz.
 *
 * @param {number} quizId
 * @returns {{ quizInfo }} - returns quiz information
 */
export function adminQuizInfo (quizId: number): QuizInfo {
  const quiz = findQuizById(quizId);

  const questions = quiz.questions?.map((q: Question) => ({
    questionId: q.questionId,
    question: q.question,
    duration: q.duration,
    thumbnailUrl: q.thumbnailUrl ? q.thumbnailUrl : undefined,
    points: q.points,
    answers: q.answers.map((a: Answer) => ({
      answerId: a.answerId,
      answer: a.answer,
      colour: a.colour,
      correct: a.correct,
    })),
  })) || [];

  const quizInfo: QuizInfo = {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: questions.length,
    questions: questions,
    duration: quiz.duration || 0,
    thumbnailUrl: quiz.thumbnailUrl ? quiz.thumbnailUrl : undefined,
  };

  return quizInfo;
}

/**
 * Update the name of the relevant quiz.
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} name
 * @returns {{}} - empty object
 */
export function adminQuizNameUpdate (authUserId: number, quizId: number, name: string): EmptyObject {
  if (!quizNameHasValidChars(name)) {
    throw new Error('Name contains invalid characters. Valid characters are alphanumeric and spaces.');
  }
  if (name.length < MIN_QUIZ_NAME_LEN || name.length > MAX_QUIZ_NAME_LEN) {
    throw new Error('Name is either less than 3 characters long or more than 30 characters long.');
  }
  if (quizNameInUse(authUserId, name)) {
    throw new Error('Name is already used by the current logged in user for another quiz.');
  }

  const quiz = findQuizById(quizId);

  quiz.name = name;
  quiz.timeLastEdited = currentTime();

  const data = getData();
  setData(data);

  return {};
}

/**
 * Update the description of the relevant quiz
 *
 * @param {number} quizId
 * @param {string} description
 * @returns {{}} - an empty object
 */
export function adminQuizDescriptionUpdate (quizId: number, description: string): EmptyObject {
  if (description.length > MAX_DESCRIPTION_LEN) {
    throw new Error('Description is more than 100 characters in length.');
  }

  const quiz = findQuizById(quizId);

  quiz.description = description;
  quiz.timeLastEdited = currentTime();

  const data = getData();
  setData(data);

  return {};
}

/**
* Restores a quiz from trash
*
* @param {number} authUserId
* @param {number} quizId
* @returns {{}}
*/
export function adminQuizRestore (authUserId: number, quizId: number): EmptyObject {
  const data = getData();
  const trashedQuiz = findTrashedQuizById(quizId);

  if (quizNameInUse(authUserId, trashedQuiz.quiz.name) === true) {
    throw new Error('Quiz name of the restored quiz is already used by the current logged in user for another active quiz.');
  }

  const index = data.trash.findIndex(q => q.quiz.quizId === quizId);
  data.trash.splice(index, 1);

  trashedQuiz.quiz.timeLastEdited = currentTime();

  data.quizzes.push(trashedQuiz.quiz);
  setData(data);

  return {};
}

/**
 * Given a user id, view all quizzes in trash
 *
 * @param {number} authUserId
 * @returns {{ quizzes: array }} - returns list of quizzes
 */
export function adminQuizTrash (authUserId: number): { quizzes: QuizList[] } {
  const data = getData();
  const trashList: QuizList[] = [];

  for (const trashItem of data.trash) {
    if (trashItem.quiz.authUserId === authUserId) {
      trashList.push({
        quizId: trashItem.quiz.quizId,
        name: trashItem.quiz.name,
      });
    }
  }

  return { quizzes: trashList };
}

/**
 * Permanently deletes specified quizzes from the trash
 *
 * @param {number[]} quizIds
 * @returns {{}}
 */
export function adminQuizTrashEmpty(quizIds: number[]): EmptyObject {
  const data = getData();

  // Find the first quizId in quizIds that is not in data.trash for every quizId
  const quizNotInTrash = quizIds.find(quizId => data.trash.every(q => q.quiz.quizId !== quizId));

  // If not undefined, there is at least one quizId not in data.trash and return error
  if (quizNotInTrash !== undefined) {
    throw new Error('One or more Quiz IDs is not currently in the trash.');
  }

  for (const quizId of quizIds) {
    // Find index of quiz with matching quizId in data.trash
    const index = data.trash.findIndex(q => q.quiz.quizId === quizId);

    // If quizId match found remove from data.trash at that index
    if (index !== -1) {
      data.trash.splice(index, 1);
    }
  }

  setData(data);

  return {};
}

/**
 * Transfer ownership of a quiz to a different user based on their email
 *
 * @param {number} authUserId - of user currently owning the quiz
 * @param {number} quizId - of the quiz to be transfered owned by authUserId
 * @param {string} userEmail - of the user to which the quiz is being
 *                             transferred to (the target user)
 * @returns {{}} - empty object
 */
export function adminQuizTransfer(quizId: number, authUserId: number, userEmail: string): EmptyObject {
  const data = getData();

  if (!adminEmailInUse(userEmail)) {
    throw new Error('The given user email is not a real user.');
  }

  const newUser = findUserByEmail(userEmail);
  if (newUser.authUserId === authUserId) {
    throw new Error('The user email refers to the current logged in user.');
  }

  // quiz to transfer
  const quiz = findQuizById(quizId);
  if (quizNameInUse(newUser.authUserId, quiz.name)) {
    throw new Error('Quiz ID already refers to a quiz that has a name that is already used by the target user.');
  }

  // check all sessions for this quiz for being in the END state
  if (quiz.activeSessions.length !== 0) {
    throw new Error('Any session for this quiz is not in END state.');
  }

  // transferring the quiz
  quiz.authUserId = newUser.authUserId;
  quiz.timeLastEdited = currentTime();

  setData(data);

  return {};
}

/**
 * Create a new stub for question for a particular quiz.
 * When this route is called, and a question is created, the timeLastEdited is set
 * as the same as the created time, and the colours of all the answers of that
 * question are randomly generated
 *
 * @param {number} quizId
 * @param {object} questionBody
 * @returns { {questionId: number} }
 */
export function adminQuizCreateQuestion(quizId: number, questionBody: QuestionBody): { questionId: number } {
  const data = getData();
  const quiz = findQuizById(quizId);

  if (questionBody.question.length > MAX_QUESTION_LEN || questionBody.question.length < MIN_QUESTION_LEN) {
    throw new Error('The question string cannot be less than 5 characters or greater than 50 characters in length.');
  }

  if (questionBody.answers.length > MAX_NUM_ANSWERS || questionBody.answers.length < MIN_NUM_ANSWERS) {
    throw new Error('The question cannot have more than 6 answers or less than 2 answers.');
  }

  if (questionBody.duration <= MIN_QUIZ_QUESTIONS_DURATION) {
    throw new Error('The question duration must be a positive number.');
  }

  if (calculateSumQuestionDuration(quizId, questionBody.duration) > MAX_QUIZ_QUESTIONS_DURATION) {
    throw new Error('The sum of the question durations cannot exceed 3 minutes.');
  }

  if (questionBody.points > MAX_POINT_VALUE || questionBody.points < MIN_POINT_VALUE) {
    throw new Error('The points awarded must not be less than 1 or not greater than 10.');
  }

  if (checkAnswerLength(questionBody, MIN_ANS_LEN, MAX_ANS_LEN)) {
    throw new Error('The answer cannot be longer than 30 characters or shorter than 1 character.');
  }

  if (checkForAnsDuplicates(questionBody)) {
    throw new Error('Answers cannot be duplicates of each other in the same question.');
  }

  if (checkForNumCorrectAns(questionBody) < MIN_CORRECT_ANS) {
    throw new Error('There must be at least 1 correct answer.');
  }

  if (questionBody.thumbnailUrl !== undefined) {
    if (questionBody.thumbnailUrl.length === 0) {
      throw new Error('The thumbnailUrl cannot be an empty string.');
    }

    if (!checkThumbnailUrlFileType(questionBody.thumbnailUrl)) {
      throw new Error('The thumbnailUrl must end with either of the following filetypes: jpg, jpeg, png');
    }

    if (!(questionBody.thumbnailUrl.startsWith('https://') || questionBody.thumbnailUrl.startsWith('http://'))) {
      throw new Error('The thumbnailUrl must start with \'http:// or \'https://');
    }
  }

  let newQuestionId = getRandomInt();
  while (questionIdInUse(newQuestionId) === true) {
    newQuestionId = getRandomInt();
  }

  const newQuestion = {
    questionId: newQuestionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: createAnswersArray(questionBody.answers),
    thumbnailUrl: questionBody.thumbnailUrl
  };

  // set timeLastEditied as the same as timeCreated for question
  quiz.timeLastEdited = currentTime();
  quiz.duration += questionBody.duration;

  quiz.questions.push(newQuestion);
  setData(data);

  return { questionId: newQuestionId };
}

/**
 * Given a question ID, swap the question with the question at the index
 * newPosition
 *
 * @param {number} questionId
 * @param {number} newPosition
 * @param {number} quizId
 * @returns {{}}
 */
export function adminQuizQuestionMove (questionId: number, newPosition: number, quizId: number): EmptyObject {
  const quiz = findQuizById(quizId);

  const question = findQuestionById(questionId, quizId);
  if (question === undefined) {
    throw new Error('Question Id does not refer to a valid question within this quiz.');
  }

  if (newPosition < MIN_QUESTION_INDEX || newPosition > quiz.questions.length - 1) {
    throw new Error('New position is less than 0 or new position is greater than n-1 where n is the number of questions.');
  }

  const questionIndex = quiz.questions.findIndex(q => q.questionId === questionId);
  if (questionIndex === newPosition) {
    throw new Error('NewPosition is the position of the current question.');
  }

  quiz.timeLastEdited = currentTime();
  quiz.questions = swapQuestions(questionIndex, newPosition, quiz.questions);

  return {};
}

/**
 * Update the description of the relevant quiz
 *
 * @param {number} quizId
 * @param {number} questionId
 * @param {QuestionBody} questionBody
 * @returns {{}}
 */
export function adminQuizQuestionUpdate(quizId: number, questionId: number, questionBody: QuestionBody): EmptyObject {
  if (questionIdInUse(questionId) === false) {
    throw new Error('Question Id does not refer to a valid question within this quiz.');
  }
  if (questionBody.question.length < MIN_QUESTION_LEN || questionBody.question.length > MAX_QUESTION_LEN) {
    throw new Error('Question  is less than 5 characters or greater than 50 characters.');
  }
  if (questionBody.answers.length < MIN_NUM_ANSWERS || questionBody.answers.length > MAX_NUM_ANSWERS) {
    throw new Error('Question has more than 6 answers or less than 2 answers.');
  }
  if (questionBody.duration <= MIN_QUIZ_QUESTIONS_DURATION) {
    throw new Error('Question duration is not a positive number.');
  }
  if (calculateSumQuestionDuration(quizId, questionBody.duration) > MAX_QUIZ_QUESTIONS_DURATION) {
    throw new Error('Sum of the question durations in the quiz exceeds 3 minutes.');
  }
  if (questionBody.points < MIN_POINT_VALUE || questionBody.points > MAX_POINT_VALUE) {
    throw new Error('Points awarded for the question are less than 1 or greater than 10.');
  }
  if (checkAnswerLength(questionBody, MIN_ANS_LEN, MAX_ANS_LEN) === true) {
    throw new Error('Length of any answer is shorter than 1 character, or longer than 30 characters.');
  }
  if (checkForAnsDuplicates(questionBody) === true) {
    throw new Error('Any answer strings are duplicates of one another.');
  }
  if (checkForNumCorrectAns(questionBody) < MIN_CORRECT_ANS) {
    throw new Error('There are no correct answers.');
  }
  if (questionBody.thumbnailUrl !== undefined) {
    if (questionBody.thumbnailUrl.length === 0) {
      throw new Error('The thumbnailUrl cannot be an empty string.');
    }

    if (!checkThumbnailUrlFileType(questionBody.thumbnailUrl)) {
      throw new Error('The thumbnailUrl must end with either of the following filetypes: jpg, jpeg, png');
    }

    if (!(questionBody.thumbnailUrl.startsWith('https://') || questionBody.thumbnailUrl.startsWith('http://'))) {
      throw new Error('The thumbnailUrl must start with \'http:// or \'https://');
    }
  }

  const data = getData();

  const questionToUpdate = findQuestionById(questionId, quizId);
  questionToUpdate.question = questionBody.question;
  questionToUpdate.duration = questionBody.duration;
  questionToUpdate.points = questionBody.points;
  questionToUpdate.answers = createAnswersArray(questionBody.answers);
  questionToUpdate.thumbnailUrl = questionBody.thumbnailUrl;

  const quiz = findQuizById(quizId);
  quiz.timeLastEdited = currentTime();
  // updating duration for the quiz
  quiz.duration = quiz.questions.reduce((newDuration, question) => newDuration + question.duration, 0);

  setData(data);

  return {};
}

/**
 * Deletes a question from the relevent quiz
 * Additionally, updates the quiz's duration and last edited time.
 *
 * @param {number} quizId
 * @param {number} questionId
 * @returns {{}}
 */
export function adminQuizQuestionDelete(quizId: number, questionId: number): EmptyObject {
  const data = getData();
  const quiz = findQuizById(quizId);

  const questionIndex = quiz.questions.findIndex(q => q.questionId === questionId);
  if (questionIndex === -1) {
    throw new Error('Question Id does not refer to a valid question within this quiz');
  }
  if (quiz.activeSessions.length !== 0) {
    throw new Error('Any session for this quiz is not in END state.');
  }

  // Remove question from question array at specified index
  quiz.questions.splice(questionIndex, 1);
  quiz.duration = quiz.questions.reduce((total, q) => total + q.duration, 0);
  quiz.timeLastEdited = currentTime();

  setData(data);

  return {};
}

/**
 * Duplicates a quiz question
 *
 * @param {number} quizId
 * @param {number} questionId
 * @returns {{ newQuestionId: number}} - returns new question ID
 */
export function adminQuizQuestionDuplicate (quizId: number, questionId: number): {newQuestionId: number} {
  const data = getData();

  const quiz = findQuizById(quizId);

  const questionIndex = quiz.questions?.findIndex(q => q.questionId === questionId);
  if (questionIndex === undefined || questionIndex === -1) {
    throw new Error('Question Id does not refer to a valid question in the quiz.');
  }

  const question = quiz.questions[questionIndex];
  let newQuestionId = getRandomInt();

  while (questionIdInUse(newQuestionId) === true) {
    newQuestionId = getRandomInt();
  }
  const newQuestion: Question = {
    ...question,
    questionId: newQuestionId,
  };

  quiz.questions.splice(questionIndex + 1, 0, newQuestion);
  quiz.duration = quiz.duration + newQuestion.duration;

  if (quiz.duration > MAX_QUIZ_QUESTIONS_DURATION) {
    quiz.questions.splice(questionIndex + 1, 1);
    throw new Error('Duplicating this question exceeds the maximum quiz duration of 3 minutes.');
  }

  quiz.timeLastEdited = currentTime();
  setData(data);

  return { newQuestionId: newQuestion.questionId };
}

/**
 * Updates the thumbnailUrl of a quiz
 *
 * @param {number} quizId
 * @param {string} thumbnailUrl
 * @returns {{}}
 */
export function adminQuizThumbnail(quizId: number, thumbnailUrl: string): EmptyObject {
  if (thumbnailUrl.length === 0) {
    throw new Error('The thumbnailUrl cannot be an empty string.');
  }

  if (!checkThumbnailUrlFileType(thumbnailUrl)) {
    throw new Error('The thumbnailUrl must end with either of the following filetypes: jpg, jpeg, png');
  }

  if (!(thumbnailUrl.startsWith('https://') || thumbnailUrl.startsWith('http://'))) {
    throw new Error('The thumbnailUrl must start with \'http:// or \'https://');
  }

  const quiz = findQuizById(quizId);
  quiz.thumbnailUrl = thumbnailUrl;
  quiz.timeLastEdited = currentTime();

  return {};
}

/**
 * Starts a new session for the given quiz
 *
 * @param {number} quizId
 * @param {number} autoStartNum
 * @returns {{ sessionId: number}} - returns new session ID
 */
export function adminQuizSessionStart(quizId: number, autoStartNum: number): { sessionId: number } {
  const quiz = findQuizById(quizId);

  if (quizIsInTrash(quizId)) {
    throw new Error('The quiz is in trash.');
  }
  if (autoStartNum > MAX_AUTO_START_NUM) {
    throw new Error('AutoStartNum is a number greater than 50.');
  }
  if (quiz.activeSessions.length === MAX_ACTIVE_QUIZ_SESSIONS) {
    throw new Error('10 sessions that are not in END state currently exist for this quiz.');
  }
  if (quiz.questions.length === 0) {
    throw new Error('The quiz does not have any questions in it.');
  }

  const newSessionId = getRandomInt();
  while (findQuizSessionById(newSessionId) !== undefined) {
    getRandomInt();
  }

  // adding new sessionId to active sessions array for this quiz
  quiz.activeSessions.push(newSessionId);

  // copying quiz from quizzes array so any edits to quiz do not affect metadata
  // active session. ignoring authUserId, active and inactive sessionIds and
  // adding numQuestions
  const quizCopy = JSON.parse(JSON.stringify(quiz));
  delete quizCopy.authUserId;
  delete quizCopy.activeSessions;
  delete quizCopy.inactiveSessions;
  quizCopy.numQuestions = quizCopy.questions.length;

  const data = getData();
  data.quizSessions.push({
    sessionId: newSessionId,
    state: QuizSessionState.LOBBY,
    atQuestion: 0,
    players: [],
    autoStartNum: autoStartNum,
    quiz: quizCopy,
    usersRankedByScore: [],
    questionResults: initialiseQuestionResults(quizCopy.questions),
    messages: [],
    resultsUpdated: false
  });

  setData(data);

  return { sessionId: newSessionId };
}

/**
 * Update the state of a particular quiz session by sending an action command
 *
 * @param {number} quizId
 * @param {number} sessionId
 * @param {QuizSessionAction} action
 * @returns {{}} - an empty object
 */
export function adminQuizSessionStateUpdate(quizId: number, sessionId: number, action: string): EmptyObject {
  const data = getData();
  const quiz = findQuizById(quizId);

  // sessionId is not valid for this quiz
  const quizSession = findQuizSessionById(sessionId);
  if (quizSession === undefined || quizSession.quiz.quizId !== quizId) {
    throw new Error('The sesssion ID does not refer to a valid session within this quiz.');
  }

  // action is not a valid Action enum
  if (!(action in QuizSessionAction)) {
    throw new Error('The action provided is not a valid Action enum.');
  }

  // action enum cannot be applied in the current state
  if (!correctSessionStateForAction(quizSession.state, action)) {
    throw new Error('The action cannot be applied in the current state of the session.');
  }

  // session state update
  if (action === QuizSessionAction.END) {
    quizSession.state = QuizSessionState.END;
    quizSession.atQuestion = 0;
    // add sessionId to inactive sessions and remove from active sessions
    quiz.inactiveSessions.push(sessionId);
    quiz.activeSessions.splice(quiz.activeSessions.indexOf(sessionId), 1);
  } else if (action === QuizSessionAction.GO_TO_ANSWER) {
    if (quizSession.state === QuizSessionState.QUESTION_OPEN) {
      cancelTimer(sessionId);
    }
    quizSession.state = QuizSessionState.ANSWER_SHOW;
    endOfQuestionUpdates(quizSession);
  } else if (action === QuizSessionAction.GO_TO_FINAL_RESULTS) {
    quizSession.state = QuizSessionState.FINAL_RESULTS;
    quizSession.atQuestion = 0;
  } else if (action === QuizSessionAction.NEXT_QUESTION) {
    beginQuestionCountdown(quizSession, sessionId);
  } else if (action === QuizSessionAction.SKIP_COUNTDOWN) {
    // clear timer if it exists and remove from array
    cancelTimer(sessionId);

    quizSession.state = QuizSessionState.QUESTION_OPEN;
  }

  if (quizSession.state === QuizSessionState.QUESTION_OPEN) {
    changeQuestionOpenToQuestionClose(quizSession, sessionId);
  }

  setData(data);
  return {};
}

/**
 * Get a link to final results in CSV format for completed quiz session
 *
 * @param {number} quizId
 * @param {number} sessionId
 * @returns {QuizSessionResultsCSV}
 */
export function adminQuizSessionResultsCSV(quizId: number, sessionId: number): QuizSessionResultsCSV {
  const quizSession = findQuizSessionById(sessionId);
  if (!quizSession) {
    throw new Error('The session Id does not refer to a valid session within this quiz.');
  }
  if (quizSession.state !== QuizSessionState.FINAL_RESULTS) {
    throw new Error('The session is not in FINAL_RESULTS state.');
  }

  // Prepare CSV headers
  const numQuestions = quizSession.questionResults.length;
  const header = ['Player'];

  for (let i = 1; i <= numQuestions; i++) {
    header.push(`question${i}score`, `question${i}rank`);
  }

  const playersData = quizSession.usersRankedByScore.map((playerRank) =>
    generatePlayerData(playerRank, quizSession.questionResults, quizSession)
  );

  // Sort players by name
  playersData.sort((a, b) => a.name.localeCompare(b.name));

  // Turning player data into an array for csv-stringify
  const data = playersData.map((player) => {
    const playerInfo: (number | string)[] = [player.name];
    for (let i = 1; i <= numQuestions; i++) {
      playerInfo.push(
        player[`question${i}score`] || 0,
        player[`question${i}rank`] || 0
      );
    }
    
    return playerInfo;
  });


  // Creating CSV content using csv-stringify
  const csvOptions = { header: true, columns: header };
  const csvContent = stringify(data, csvOptions);
  const csvDirectory = path.join(__dirname, 'csv');

  // Checking directory exists, if not create one
  if (!fs.existsSync(csvDirectory)) {
    fs.mkdirSync(csvDirectory, { recursive: true });
  }

  // Creating CSV file path
  const csvFilename = `quiz_${quizId}_session_${sessionId}_results.csv`;
  const csvFilePath = path.join(csvDirectory, csvFilename);

  // Writing CSV contents to the file
  try {
    fs.writeFileSync(csvFilePath, csvContent, 'utf8');
  } catch (writeError) {
    console.error('Error writing CSV file:', writeError);
    throw writeError;
  }

  // Creating the URL for the CSV file
  const baseUrl = process.env.BASE_URL || 'http://localhost:3200';
  const csvUrl = `${baseUrl}/csv/${csvFilename}`;

  return { url: csvUrl };
}

/**
 * Get the status of a particular quiz session
 *
 * @param {number} quizId
 * @param {number} sessionId
 * @returns {QuizSessionStatus}
 */
export function adminQuizGetSessionStatus(quizId: number, sessionId: number): QuizSessionStatus {
  const quizSession = findQuizSessionById(sessionId);
  if (!quizSession || quizSession.quiz.quizId !== quizId) {
    throw new Error('The session ID does not refer to a valid session within this quiz.');
  }

  // sort names into ascending order
  const playerNames: string[] = [];
  for (const player of quizSession.players) {
    playerNames.push(player.name);
  }
  const sortedPlayers = playerNames.sort();

  const sessionStatus: QuizSessionStatus = {
    state: quizSession.state,
    atQuestion: quizSession.atQuestion,
    players: sortedPlayers,
    metadata: quizSession.quiz,
  };

  return sessionStatus;
}

/**
 * Retrieves active and inactive session ids (sorted in ascending order) for a quiz
 *
 * @param {number} quizId
 * @returns {QuizSessionsView}
 */
export function adminQuizSessionsView(quizId: number): QuizSessionsView {
  const quiz = findQuizById(quizId);

  quiz.activeSessions.sort((id1, id2) => id1 - id2);
  quiz.inactiveSessions.sort((id1, id2) => id1 - id2);

  return {
    activeSessions: quiz.activeSessions,
    inactiveSessions: quiz.inactiveSessions
  };
}
