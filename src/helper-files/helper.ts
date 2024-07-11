// Includes helper functions for auth.ts and quiz.ts

import { Answer, getData, Question, Quizzes, Users, Trash } from '../dataStore';
import { QuestionBody, QuizQuestionAnswers } from '../quiz';

/**
 * Function checks if an authUserId exists in the dataStore
 *
 * @param {number} authUserId
 * @returns {boolean} true if authUserId is valid otherwise false
 */
export function authUserIdExists(authUserId: number): boolean {
  const user = findUserById(authUserId);

  if (user === undefined) {
    return false;
  } else {
    return true;
  }
}

// ========================= AUTH HELPER FUNCTIONS ========================== //
/**
 * Function checks if an email is already being used by an existing user
 *
 * @param {string} email
 * @returns {boolean} true if email exists, false if not
 */
export function adminEmailInUse(email: string): boolean {
  const user = findUserByEmail(email);

  if (user === undefined) {
    return false;
  } else {
    return true;
  }
}

/**
 * Function checks if a name is valid (ie doesn't contain a number or
 * special characters other than spaces, hyphens or apostrophes)
 *
 * @param {string} name
 * @returns {boolean} true if a name is valid otherwise false
 */
export function adminUserNameIsValid(name: string): boolean {
  // specialCharacters will match any string that includes a special
  // character except for space, hyphen or apostrophe
  const specialCharacters = /[^A-Za-z\s'-]/;
  if (specialCharacters.test(name)) {
    return false;
  } else {
    return true;
  }
}

/**
 * Function checks whether the given password contains atleast one number and
 * atleast one letter
 *
 * @param {string} password to check
 * @returns {boolean} true if password has neccessary chars otherwise false
 */
export function adminPasswordHasValidChars(password: string): boolean {
  if (/\d/.test(password) && /[a-zA-Z]/.test(password)) {
    return true;
  } else {
    return false;
  }
}

/**
 * Function checks previousPassword array to determine whether a user has already
 * used a password when updating the password
 *
 * @param {number} authUserId
 * @param {string} newPassword
 * @returns {boolean} true if newPassword matches any previous passwords
 */
export function adminCheckPasswordHistory(authUserId: number, newPassword: string): boolean {
  const user = findUserById(authUserId);
  for (const password of user.previousPasswords) {
    if (password === newPassword) {
      return true;
    }
  }

  return false;
}

/**
 * Finds a user in the data store by authUserId
 *
 * @param {number} authUserId - The authUserId to find
 * @returns {Users | undefined} - The user object if found | undefined
 */
export function findUserById(authUserId: number): Users | undefined {
  const data = getData();
  return data.users.find(user => user.authUserId === authUserId);
}

/**
 * Finds a user in the data store by email
 *
 * @param {string} email - The email to find
 * @returns {Users | undefined} - The user object if found | undefined
 */
export function findUserByEmail(email: string): Users | undefined {
  const data = getData();
  return data.users.find(user => user.email === email);
}

// ========================= QUIZ HELPER FUNCTIONS ========================== //
/**
 * Function checks if a quiz name contains any invalid characters. Characters
 * are considered invalid if they are not alphanumeric or spaces e.g. @
 *
 * @param {String} name
 * @returns {boolean} true if name does not contain any invalid characters,
 *                    false if it does
 */
export function quizNameHasValidChars(name: string): boolean {
  if (/^[A-Za-z0-9 ]*$/.test(name) === false) {
    return false;
  } else {
    return true;
  }
}

/**
 * Function checks if a quiz name has already been used by the current logged
 * in user
 *
 * @param {Number} authUserId
 * @param {String} name
 * @returns {boolean} true if name has been used, false if it has not
 */
export function quizNameInUse(authUserId: number, name: string): boolean {
  const data = getData();

  for (const quiz of data.quizzes) {
    if (quiz.authUserId === authUserId && quiz.name === name) {
      return true;
    }
  }
  return false;
}

/**
 * Function checks if a quiz ID has already been used by another quiz
 *
 * @param {Number} quizId
 * @returns {boolean} true if quiz ID has been used, false if it has not
 */
export function quizIdInUse(quizId: number): boolean {
  const quiz = findQuizById(quizId);

  if (quiz === undefined) {
    const data = getData();
    const trashQuiz = data.trash.find(q => q.quiz.quizId === quizId);
    if (trashQuiz === undefined) {
      return false;
    }
  }
  return true;
}

/**
 * Finds a quiz in the data by its quiz ID
 *
 * @param {number} quizId - The ID of the quiz to find
 * @returns {Quizzes | undefined} - The quiz with the specified ID | undefined
 */
export function findQuizById(quizId: number): Quizzes | undefined {
  const data = getData();
  return data.quizzes.find(q => q.quizId === quizId);
}

/**
 * Finds a quiz in the trash by its quiz ID
 *
 * @param {number} quizId - The ID of the quiz to find
 * @returns {Quizzes | undefined} - The quiz with the specified ID | undefined
 */
export function findTrashedQuizById(quizId: number): Trash | undefined {
  const data = getData();
  return data.trash.find(q => q.quiz.quizId === quizId);
}

/**
 * Function checks if a quiz with a matching quiz ID is in the trash
 *
 * @param {number} quizId - The ID of the quiz to find
 * @returns {boolean} - true if there is a quiz in the trash, false if not
 */
export function quizIsInTrash(quizId: number): boolean {
  const quiz = findTrashedQuizById(quizId);
  if (quiz === undefined) {
    return false;
  }
  return true;
}

/**
 * Finds a question in the data by its question ID
 *
 * @param {number} questionId - ID of the question to find
 * @param {number} quizId - ID of the quiz to find
 * @returns {Question | undefined} - the question with the specified ID | undefined
 */
export function findQuestionById(questionId: number, quizId: number): Question | undefined {
  const quiz = findQuizById(quizId);
  return quiz.questions.find(q => q.questionId === questionId);
}

/**
 * Checks if a questionId has been used already by another question
 *
 * @param {number} questionId
 * @return {boolean} true if questionId has been used, false otherwise
 */
export function questionIdInUse(questionId: number): boolean {
  const data = getData();
  for (const quiz of data.quizzes) {
    const question = findQuestionById(questionId, quiz.quizId);
    if (question !== undefined) {
      return true;
    }
  }

  return false;
}

/**
 * Finds an answer given the answer ID, question ID and quiz ID
 *
 * @param {number} answerId
 * @param {number} questionId
 * @param {number} quizId
 * @return { Answer | undefined }
 */
export function findAnswerById(answerId: number, questionId: number, quizId: number): Answer | undefined {
  const question = findQuestionById(questionId, quizId);
  return question.answers.find(a => a.answerId === answerId);
}

/**
 * Checks whether an answer ID has been used by another answer
 *
 * @param {number} answerId
 * @returns {boolean} - true if answerId has been used, false otherwise
 */
export function answerIdInUse(answerId: number): boolean {
  const data = getData();
  for (const quiz of data.quizzes) {
    for (const question of quiz.questions) {
      const answer = findAnswerById(answerId, question.questionId, quiz.quizId);
      if (answer !== undefined) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculates the sum of question durations of a quiz given by its quiz ID
 *
 * @param {number} quizId - ID of quiz to find
 * @param {number} questionDuration - duration of the question
 * @returns {number} - the sum of the question durations in seconds
 */
export function calculateSumQuestionDuration(quizId: number, questionDuration: number): number {
  const quiz = findQuizById(quizId);

  return quiz.duration + questionDuration;
}

/**
 * Checks whether any of the answers in a question are too short or too long
 *
 * @param {QuestionBody} questionBody
 * @param {number} minAnsLength
 * @param {number} maxAnsLength
 * @returns {boolean} - returns true if any answer is too short/long, false
 *                      otherwise
 */
export function checkAnswerLength(questionBody: QuestionBody, minAnsLength: number, maxAnsLength: number): boolean {
  for (const answer of questionBody.answers) {
    if (answer.answer.length < minAnsLength || answer.answer.length > maxAnsLength) {
      return true;
    }
  }

  return false;
}

/**
 * Determines whether any answer strings are duplicates
 *
 * @param {QuestionBody} questionBody
 * @returns {boolean} returns true if there are duplicates, false otherwise
 */
export function checkForAnsDuplicates(questionBody: QuestionBody): boolean {
  const answerStrings = questionBody.answers.map((a: Answer) => (a.answer));

  let i = 0;
  while (i < questionBody.answers.length) {
    const answerToCompare = answerStrings.shift();
    for (const answer1 of answerStrings) {
      if (answerToCompare.localeCompare(answer1) === 0) {
        return true;
      }
    }
    answerStrings.push(answerToCompare);
    i++;
  }

  return false;
}

/**
 * Checks for any correct answers in a question
 *
 * @param {QuestionBody} questionBody
 * @returns {number} - returns the number of correct answers in a question
 */
export function checkForNumCorrectAns(questionBody: QuestionBody): number {
  let numCorrectAns = 0;

  for (const answer of questionBody.answers) {
    if (answer.correct === true) {
      numCorrectAns++;
    }
  }

  return numCorrectAns;
}

/**
 * Loops through given answers and creates a new array which contains additional
 * fields for each object: answerId and colour.
 *
 * @param {QuizQuestionAnswers[]} givenAnswers
 * @returns {Answer[]} returns the answers array for a quiz's questions
 */
export function createAnswersArray(givenAnswers: QuizQuestionAnswers[]): Answer[] {
  const questionAnswersArray = [];
  for (const answer of givenAnswers) {
    let newAnswerId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    while (answerIdInUse(newAnswerId) === true) {
      newAnswerId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    }

    questionAnswersArray.push({
      answerId: newAnswerId,
      answer: answer.answer,
      colour: generateAnsColour(),
      correct: answer.correct
    });
  }

  return questionAnswersArray;
}

/**
 * Function picks a random colour (string) from an array
 *
 * @returns {string} - colour
 */
export function generateAnsColour(): string {
  const answerColours = ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange'];
  const colourIndex = Math.floor(Math.random() * answerColours.length);
  return answerColours[colourIndex];
}

/**
 * Function swaps the questions at the given indexes
 *
 * @param {number} questionIndex1 - The index of the first question
 * @param {number} questionIndex2 - The index of the second question
 * @param {Question[]} questionArr - The array of questions
 * @returns {Question[]}
 */
export function swapQuestions(questionIndex1: number, questionIndex2: number, questionArr: Question[]): Question[] {
  if (questionIndex1 < questionIndex2) {
    const temp = questionIndex1;
    questionIndex1 = questionIndex2;
    questionIndex2 = temp;
  }

  const question1 = questionArr.splice(questionIndex1, 1);
  const question2 = questionArr.splice(questionIndex2, 1);

  questionArr.splice(questionIndex2, 0, question1[0]);
  questionArr.splice(questionIndex1, 0, question2[0]);

  return questionArr;
}
