import { setData, getData, ErrorObject, EmptyObject, Quizzes, Question, Answer } from './dataStore';
import {
  authUserIdExists,
  quizNameHasValidChars,
  quizNameInUse,
  quizIdInUse,
  findQuizById,
  quizIsInTrash,
  findTrashedQuizById,
  calculateSumQuestionDuration,
  checkAnswerLength,
  checkForAnsDuplicates,
  checkForNumCorrectAns,
  questionIdInUse,
  answerIdInUse,
  generateAnsColour
} from './helper-files/helper';

/// //////////////////////////// Global Variables //////////////////////////////
const MIN_QUIZ_NAME_LEN = 3;
const MAX_QUIZ_NAME_LEN = 30;
const MAX_DESCRIPTION_LEN = 100;

const MIN_QUESTION_LEN = 5;
const MAX_QUESTION_LEN = 50;

const MIN_NUM_ANSWERS = 2;
const MAX_NUM_ANSWERS = 6;

const MAX_QUIZ_QUESTIONS_DURATION = 180;

const MIN_POINT_VALUE = 1;
const MAX_POINT_VALUE = 10;

const MIN_ANS_LEN = 1;
const MAX_ANS_LEN = 30;

const MIN_CORRECT_ANS = 1;

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

export interface QuizQuestionAnswers {
  answer: string;
  correct: boolean;
}

export interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: QuizQuestionAnswers[];
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

  const emptyQuestions: Question[] = [];

  const newQuiz = {
    authUserId: authUserId,
    quizId: newQuizId,
    name: name,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: <number> undefined,
    description: description,
    questions: emptyQuestions,
    duration: 0,
  };

  data.quizzes.push(newQuiz);
  setData(data);

  return { quizId: newQuizId };
}

/**
 * Given a particular quiz, move quiz to trash
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

/**
 * Create a new stub for question for a particular quiz.
 * When this route is called, and a question is created, the timeLastEdited is set
 * as the same as the created time, and the colours of all the answers of that
 * question are randomly generated
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @param {object} questionBody
 * @returns { {questionId: number} | { error: string}}
 */
export function adminQuizCreateQuestion(authUserId: number, quizId: number, questionBody: QuestionBody): { questionId: number } | ErrorObject {
  const data = getData();
  const quiz = findQuizById(quizId);

  if (questionBody.question.length > MAX_QUESTION_LEN || questionBody.question.length < MIN_QUESTION_LEN) {
    return { error: 'The question string cannot be less than 5 characters or greater than 50 characters in length.' };
  }

  if (questionBody.answers.length > MAX_NUM_ANSWERS || questionBody.answers.length < MIN_NUM_ANSWERS) {
    return { error: 'The question cannot have more than 6 answers or less than 2 answers.' };
  }

  if (questionBody.duration <= 0) {
    return { error: 'The question duration must be a positive number.' };
  }

  if (calculateSumQuestionDuration(quizId, questionBody.duration) > MAX_QUIZ_QUESTIONS_DURATION) {
    return { error: 'The sum of the question durations cannot exceed 3 minutes.' };
  }

  if (questionBody.points > MAX_POINT_VALUE || questionBody.points < MIN_POINT_VALUE) {
    return { error: 'The points awarded must not be less than 1 or not greater than 10.' };
  }

  if (checkAnswerLength(questionBody, MIN_ANS_LEN, MAX_ANS_LEN) === true) {
    return { error: 'The answer cannot be longer than 30 characters or shorter than 1 character.' };
  }

  if (checkForAnsDuplicates(questionBody) === true) {
    return { error: 'Answers cannot be duplicates of each other in the same question.' };
  }

  if (checkForNumCorrectAns(questionBody) < MIN_CORRECT_ANS) {
    return { error: 'There must be at least 1 correct answer.' };
  }

  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUser ID is not a valid user.' };
  }

  if (quizIdInUse(quizId) === false) {
    return { error: 'Quiz ID does not refer to a quiz that exists.' };
  }

  let newQuestionId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  while (questionIdInUse(newQuestionId) === true) {
    newQuestionId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  // create answers to the question
  const questionAnswersArray = [];
  for (const answer of questionBody.answers) {
    let newAnswerId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    while (answerIdInUse(newAnswerId) === true) {
      newAnswerId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    }

    const answerColour = generateAnsColour();

    const newAnswer = {
      answerId: newAnswerId,
      answer: answer.answer,
      colour: answerColour,
      correct: answer.correct
    };
    questionAnswersArray.push(newAnswer);
  }

  const newQuestion = {
    questionId: newQuestionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: questionAnswersArray
  };

  // set timeLastEditied as the same as timeCreated for question
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  quiz.duration += questionBody.duration;

  quiz.questions.push(newQuestion);
  setData(data);

  return { questionId: newQuestionId };
}

/**
 * Restores a quiz from trash
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {{} | { error: string }}
 */
export function adminQuizRestore (authUserId: number, quizId: number): EmptyObject | ErrorObject {
  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  if (quizIsInTrash(quizId) === false) {
    return { error: 'Quiz ID refers to a quiz that is not currently in the trash' };
  }

  const data = getData();
  const trashedQuiz = findTrashedQuizById(quizId);

  if (quizNameInUse(authUserId, trashedQuiz.quiz.name) === true) {
    return { error: 'Quiz name of the restored quiz is already used by the current logged in user for another active quiz' };
  }

  const index = data.trash.findIndex(q => q.quiz.quizId === quizId);
  data.trash.splice(index, 1);

  trashedQuiz.quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  data.quizzes.push(trashedQuiz.quiz);
  setData(data);

  return {};
}

/**
 * Given a user id, view all quizzes in trash
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {{ quizzes: array } | { error: string }} - returns list of quizzes
 */
export function adminQuizTrash (authUserId: number): { quizzes: QuizList[] } | ErrorObject {
  if (authUserIdExists(authUserId) === false) {
    return { error: 'AuthUserId does not refer to a valid user id.' };
  }

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
 * Transfer ownership of a quiz to a different user based on their email
 * 
 * @param {number} authUserId - of user currently owning the quiz
 * @param {number} quizId - of the quiz to be transfered
 * @param {string} userEmail - of the user to which the quiz is being
 *                             transferred to
 * @returns {{} | { error: string }} 
 */
export function adminQuizTransfer(authUserId: number, quizId: number, userEmail: string) : EmptyObject | ErrorObject {

  // userEmail is not a real user
    // look through users[] to see if email exists i.e. not registered

  // userEmail is the current logged in user
    // find if userEmail is in users[].email

  // quizId refers to a quiz that has a name that is already used by the target user
    // look through userEmail quizzes to see if one of their quizzes has the same name
    // as the quiz found with quizID

  // transferring the quiz
  // update timeLastEdited

  return {};
}
