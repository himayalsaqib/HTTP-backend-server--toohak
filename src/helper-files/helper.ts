// Includes helper functions for auth.ts and quiz.ts

import { Answer, getData, Question, Quizzes, Users, Trash, QuizSessions, QuestionResults } from '../dataStore';
import { QuestionBody, QuizAnswerColours, QuizQuestionAnswers, QuizSessionAction, QuizSessionState, sessionIdToTimerArray } from '../quiz';
import crypto from 'crypto';

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
  }
  return true;
}

/**
 * Function generates and returns a random integer for ids
 *
 * @returns {number}
 */
export function getRandomInt(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
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
  return /\d/.test(password) && /[a-zA-Z]/.test(password);
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

/**
 * generates a sha256 hash for given password
 *
 * @param {string} password
 * @returns {string} hash of password
 */
export function getHashOf(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
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
 * @returns {Trash | undefined} - The quiz with the specified ID | undefined
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
    let newAnswerId = getRandomInt();
    while (answerIdInUse(newAnswerId) === true) {
      newAnswerId = getRandomInt();
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
 * @returns {QuizAnswerColours} - colour
 */
export function generateAnsColour(): QuizAnswerColours {
  const answerColours = Object.values(QuizAnswerColours);
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

/**
 * Function gets the current time in seconds to 10 significant figures
 *
 * @returns {number} time
 */
export function currentTime(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Function that checks whether the end of the given thumbnailUrl contains the
 * correct file type (jpg, jpeg, png)
 *
 * @param {string} thumbnailUrl
 * @returns {boolean} - true if the end contains one of the correct file types,
 *                      false otherwise
 */
export function checkThumbnailUrlFileType(thumbnailUrl: string): boolean {
  if (thumbnailUrl.endsWith('jpg') || thumbnailUrl.endsWith('jpeg') || thumbnailUrl.endsWith('png')) {
    return true;
  }
  return false;
}

/**
 * Finds a quiz session in the data by its session ID
 *
 * @param {number} sessionId - The ID of the quiz session to find
 * @returns {QuizSessions | undefined}
 */
export function findQuizSessionById(sessionId: number): QuizSessions | undefined {
  const data = getData();
  return data.quizSessions.find(session => session.sessionId === sessionId);
}

/**
 * Based on the state of a quizSession determine whether the action can be applied
 *
 * @param {QuizSessionState} state - of the current session
 * @param {string} action - the action to change states
 * @returns {boolean} - false if action is not applicable in current state,
 *                      true otherwise
 */
export function correctSessionStateForAction(state: QuizSessionState, action: string): boolean {
  if (state === QuizSessionState.ANSWER_SHOW) {
    if (!(action === QuizSessionAction.END || action === QuizSessionAction.NEXT_QUESTION || action === QuizSessionAction.GO_TO_FINAL_RESULTS)) {
      return false;
    }
  }

  if (state === QuizSessionState.END) {
    return false;
  }

  if (state === QuizSessionState.FINAL_RESULTS) {
    if (!(action === QuizSessionAction.END)) {
      return false;
    }
  }

  if (state === QuizSessionState.LOBBY) {
    if (!(action === QuizSessionAction.END || action === QuizSessionAction.NEXT_QUESTION)) {
      return false;
    }
  }

  if (state === QuizSessionState.QUESTION_CLOSE) {
    if (action === QuizSessionAction.SKIP_COUNTDOWN) {
      return false;
    }
  }

  if (state === QuizSessionState.QUESTION_COUNTDOWN) {
    if (!(action === QuizSessionAction.SKIP_COUNTDOWN || action === QuizSessionAction.END)) {
      return false;
    }
  }

  if (state === QuizSessionState.QUESTION_OPEN) {
    if (!(action === QuizSessionAction.END || action === QuizSessionAction.GO_TO_ANSWER)) {
      return false;
    }
  }

  return true;
}

/**
 * Checks whether a timer exists for a given sessionId
 *
 * @param {number} sessionId
 * @returns {boolean} - true if a timeoutId exists, false otherwise
 */
export function checkIfTimerExists(sessionId: number): boolean {
  return sessionIdToTimerArray.some(item => item.sessionId === sessionId);
}

/**
 * Initialised an array for question results that can be updated as session
 * progresses and players answer
 *
 * @param {Question[]} questions
 * @returns {QuestionResults[]}
 */
export function initialiseQuestionResults(questions: Question[]): QuestionResults[] {
  const questionResults = [];
  for (const question of questions) {
    const newQuestion: QuestionResults = {
      questionId: question.questionId,
      playersCorrectList: [],
      playersAnsweredList: [],
      averageAnswerTime: 0,
      percentCorrect: 0,
    };
    questionResults.push(newQuestion)
  }

  return questionResults;
}

// ======================== PLAYER HELPER FUNCTIONS ========================= //

/**
 * Function moves onto next state if number of players joined matches autoStartNum
 *
 * @param {QuizSessions} session
 */
export function updateSessionStateIfAutoStart(session: QuizSessions): void {
  if (session.players.length === session.autoStartNum) {
    session.state = QuizSessionState.QUESTION_COUNTDOWN;
  }
}

/**
 * Function generates a random name if player name is empty string
 *
 * @param {}
 * @returns {string} random name
 */
export function generateRandomName(): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  let name = '';

  // Generate 5 unique letters
  while (name.length < 5) {
    const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
    if (!name.includes(randomLetter)) {
      name += randomLetter;
    }
  }

  // Generate 3 unique numbers
  while (name.length < 8) {
    const randomNumber = numbers.charAt(Math.floor(Math.random() * numbers.length));
    if (!name.includes(randomNumber)) {
      name += randomNumber;
    }
  }

  return name;
}

/**
 * Function checks if a player name already exists in the session
 *
 * @param {number} sessionId
 * @param {string} playerName
 * @returns {boolean} true if player name has been used, false if it has not
 */
export function playerNameExists(sessionId: number, playerName: string): boolean {
  const session = findQuizSessionById(sessionId);
  return session.players.some(player => player.name === playerName);
}

/**
 * Function checks if a player ID has already been used by another player
 *
 * @param {Number} playerId
 * @returns {boolean} true if player ID has been used, false if it has not
 */
export function playerIdInUse(playerId: number): boolean {
  const data = getData();
  return data.players.some(player => player.playerId === playerId);
}

/**
 * Function returns the session the given player is in
 *
 * @param {number} playerId
 * @returns {QuizSessions | undefined} sessionId | undefined if session does not exist
 */
export function findSessionByPlayerId(playerId: number): QuizSessions | undefined {
  const data = getData();
  const session = data.quizSessions.find(q =>
    q.players.some(player => player.playerId === playerId) === true);

  return session;
}

/**
 * Function returns the name corresponding to a given player ID
 *
 * @param {number} playerId
 * @returns {string | undefined} name | undefined if player does not exist
 */
export function findNameByPlayerId(playerId: number): string | undefined {
  const data = getData();
  const player = data.players.find(player => player.playerId === playerId);
  return player?.name;
}
