import e from 'express';
import { Answer, getData, Question, Quizzes, Users } from '../dataStore';
import { QuestionBody } from '../quiz';

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

/// ///////////////////////// Auth Helper Functions ////////////////////////////
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

/// ///////////////////////// Quiz Helper Functions ////////////////////////////
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
 * Finds a question in the data by its question ID
 * 
 * @param {number} questionId - ID of the question to find
 * @param {number} quizId - ID of the quiz to find
 * @returns {Question | undefined} - the quetion with the specified ID | undefined
 */
export function findQuestionById(questionId: number, quizId: number ): Question | undefined {
  const quiz = findQuizById(quizId);
  return quiz.questions.find(q => q.questionId === questionId);
}

/**
 * Checks if a questionId has been used already by another question
 * 
 * @param {number} questionId
 * @param {number} quizId
 * @return {boolean} true if questionId has been used, false otherwise
 */
export function questionIdInUse(questionId: number, quizId: number): boolean {
  const question = findQuestionById(questionId, quizId);

  if (question === undefined) {
    return false;
  } else {
    return true;
  }
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
 * @param {number} answerId
 * @param {number} questionId
 * @param {number} quizId
 * @returns {boolean} - true if answerId has been used, false otherwise
 */
export function answerIdInUse(answerId: number, questionId: number, quizId: number): boolean {
  const answer = findAnswerById(answerId, questionId, quizId)

  if (answer.answerId === undefined) {
    return false
  } else {
    return true;
  }
}

/**
 * Calculates the sum of question durations of a quiz given by its quiz ID
 * 
 * @param {number} quizId - ID of quiz to find
 * @returns {number} - the sum of the question durations in seconds 
 */
export function calculateSumQuestionDuration(quizId: number): number {
  let sumQuestionDuration = 0;

  const quiz = findQuizById(quizId);

  for (const question of quiz.questions) {
    sumQuestionDuration += question.duration;
  }

  return sumQuestionDuration;
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
  const answerDuplicates = [];
  for (const answer of questionBody.answers) {
    if (answer.answer.indexOf(answer.toString()) !== answer.answer.lastIndexOf(answer.toString())) {
      answerDuplicates.push(answer);
    }
  }

  if (answerDuplicates.length > 0) {
    return true;
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
      numCorrectAns++
    }
  }

  return numCorrectAns;
}
