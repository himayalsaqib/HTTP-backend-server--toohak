import { setData, getData, ErrorObject, EmptyObject, Quizzes, Question, Answer } from './dataStore';
import {
  authUserIdExists,
  quizNameHasValidChars,
  quizNameInUse,
  quizIdInUse,
  findQuizById
} from './helper-files/helper';

/// //////////////////////////// Global Variables //////////////////////////////
const MIN_QUIZ_NAME_LEN = 3;
const MAX_QUIZ_NAME_LEN = 30;
const MAX_DESCRIPTION_LEN = 100;

/// /////////////////////////// Type Annotations ///////////////////////////////
interface QuizList {
  quizId: number;
  name: string;
}

export interface QuizInfo extends Omit<Quizzes, 'authUserId'> {
  numQuestions: number,
  questions: Question[],
  duration: number,
}

/// ////////////////////////////// Functions ///////////////////////////////////
/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {number} authUserId
 * @returns {{ quizzes: { quizList }[] } | { error: string }}
 */
export function adminQuizList(authUserId: number): { quizzes: QuizList[] } | ErrorObject {
  const data = getData();
  const quizList = [];

  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId does not refer to a valid user id.' };
  }

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
 * @returns {{ quizId: number } | { error: string }} - assigns a quizId | error
 */
export function adminQuizCreate(authUserId: number, name: string, description: string): { quizId: number } | ErrorObject {
  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  if (quizNameHasValidChars(name) === false) {
    return {
      error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.'
    };
  }
  if (name.length < MIN_QUIZ_NAME_LEN || name.length > MAX_QUIZ_NAME_LEN) {
    return {
      error: 'Name is either less than 3 characters long or more than 30 characters long.'
    };
  }
  if (quizNameInUse(authUserId, name) === true) {
    return {
      error: 'Name is already used by the current logged in user for another quiz.'
    };
  }
  if (description.length > MAX_DESCRIPTION_LEN) {
    return { error: 'Description is more than 100 characters in length.' };
  }

  const data = getData();
  let newQuizId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  while (quizIdInUse(newQuizId) === true) {
    newQuizId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  const newQuiz = {
    authUserId: authUserId,
    quizId: newQuizId,
    name: name,
    timeCreated: parseFloat(Date.now().toFixed(10)),
    timeLastEdited: <number> undefined,
    description: description,
  };

  data.quizzes.push(newQuiz);
  setData(data);

  return { quizId: newQuizId };
}

/**
 * Given a particular quiz, permanently remove the quiz
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {{} | { error: string }} - an empty object
 */
export function adminQuizRemove (authUserId: number, quizId: number): EmptyObject | ErrorObject {
  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId does not refer to a valid user id.' };
  } else if (quizIdInUse(quizId) === false) {
    return { error: 'Quiz Id does not refer to a valid quiz.' };
  }
  const data = getData();
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const quiz = data.quizzes[quizIndex];

  if (quiz.authUserId !== authUserId) {
    return { error: 'Quiz does not belong to user.' };
  }
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  data.trash.push({ quiz: quiz });
  data.quizzes.splice(quizIndex, 1);
  setData(data);

  return {};
}

/**
 * Get all of the relevant information about the current quiz.
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {{ quizInfo } | { error: string }} - returns quiz information
 */
export function adminQuizInfo (authUserId: number, quizId: number): QuizInfo | ErrorObject {
  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  if (quizIdInUse(quizId) === false) {
    return { error: 'Quiz ID does not refer to a valid quiz.' };
  }

  const quiz = findQuizById(quizId);

  if (quiz.authUserId !== authUserId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  const questions = quiz.questions?.map((q: Question) => ({
    questionId: q.questionId,
    question: q.question,
    duration: q.duration,
    points: q.points,
    answers: q.answers.map((a: Answer) => ({
      answerId: a.answerId,
      answer: a.answer,
      colour: a.colour,
      correct: a.correct,
    })),
  })) || [];

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: questions.length,
    questions: questions,
    duration: quiz.duration || 0,
  };
}

/**
 * Update the name of the relevant quiz.
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} name
 * @returns {{} | { error: string }} - empty object
 */
export function adminQuizNameUpdate (authUserId: number, quizId: number, name: string): EmptyObject | ErrorObject {
  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  if (quizIdInUse(quizId) === false) {
    return { error: 'Quiz ID does not refer to a valid quiz.' };
  }
  if (quizNameHasValidChars(name) === false) {
    return {
      error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.'
    };
  }
  if (name.length < MIN_QUIZ_NAME_LEN || name.length > MAX_QUIZ_NAME_LEN) {
    return {
      error: 'Name is either less than 3 characters long or more than 30 characters long.'
    };
  }
  if (quizNameInUse(authUserId, name)) {
    return {
      error: 'Name is already used by the current logged in user for another quiz.'
    };
  }

  const quiz = findQuizById(quizId);

  if (quiz.authUserId !== authUserId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }
  quiz.name = name;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  const data = getData();
  setData(data);

  return {};
}

/**
 * Update the description of the relevant quiz
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} description
 * @returns {{} | { error: string }} - an empty object
 */
export function adminQuizDescriptionUpdate (authUserId: number, quizId: number, description: string): EmptyObject | ErrorObject {
  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  if (quizIdInUse(quizId) === false) {
    return { error: 'Quiz ID does not refer to a valid quiz.' };
  }
  if (description.length > MAX_DESCRIPTION_LEN) {
    return { error: 'Description is more than 100 characters in length.' };
  }

  const quiz = findQuizById(quizId);

  if (quiz.authUserId !== authUserId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  quiz.description = description;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  const data = getData();
  setData(data);

  return {};
}
