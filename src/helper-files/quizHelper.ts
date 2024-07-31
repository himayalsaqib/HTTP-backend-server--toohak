// ========================= QUIZ HELPER FUNCTIONS ========================== //

import {
  Answer,
  getData,
  PlayerAnswered,
  Question,
  QuestionResults,
  QuizSessions,
  Quizzes,
  setData,
  Trash,
  UsersRanking
} from '../dataStore';
import {
  QuestionBody,
  QuizAnswerColours,
  QuizQuestionAnswers,
  QuizSessionAction,
  QuizSessionState,
  sessionIdToTimerArray,
  WAIT_THREE_SECONDS,
  PlayerResultsData
} from '../quiz';
import { currentTime, getRandomInt } from './authHelper';
import { findNameByPlayerId } from './playerHelper';

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
 * Checks whether a timer exists for a given sessionId and cancels it. For
 * two scenarios: (QUESTION_OPEN --> ANSWER_SHOW) or (if SKIP_COUNTDOWN action)
 *
 * @param {number} sessionId
 * @returns {void}
 */
export function cancelTimer(sessionId: number): void {
  if (checkIfTimerExists(sessionId)) {
    const timerId = sessionIdToTimerArray.find(i => i.sessionId === sessionId);
    const index = sessionIdToTimerArray.findIndex(i => i.sessionId === sessionId);
    clearTimeout(timerId.timeoutId);
    sessionIdToTimerArray.splice(index, 1);
  }
}

/**
 * This function starts the 3 second timer that changes the state from QUESTION_COUNTDOWN
 * to QUESTION_OPEN in a quizSession
 *
 * @param {QuizSessions} quizSession
 * @param {number} sessionId
 * @returns {void}
 */
export function beginQuestionCountdown(quizSession: QuizSessions, sessionId: number): void {
  quizSession.state = QuizSessionState.QUESTION_COUNTDOWN;
  // increment atQuestion
  quizSession.atQuestion++;
  // new question so results not updated
  quizSession.resultsUpdated = false;
  // start countdown timer
  const timeoutId = setTimeout(() => {
    // update state
    const data = getData();
    quizSession.state = QuizSessionState.QUESTION_OPEN;
    setData(data);
    // remove timerId from array (if it exists) after the 3 seconds and clear timer
    const index = sessionIdToTimerArray.findIndex(i => i.timeoutId === timeoutId);
    if (index !== -1) {
      sessionIdToTimerArray.splice(index, 1);
      clearTimeout(timeoutId);
    }

    changeQuestionOpenToQuestionClose(quizSession, sessionId);
  }, WAIT_THREE_SECONDS * 1000);
  // add timerID to array
  sessionIdToTimerArray.push({ sessionId: sessionId, timeoutId: timeoutId });
}

/**
 * Calculate duration of a question using the atQuestion from quizSession and
 * create a timer which changes the state of session from QUESTION_OPEN to
 * QUESTION_CLOSE
 *
 * @param {QuizSessions} quizSession
 * @param {number} sessionId
 * @returns {void}
 */
export function changeQuestionOpenToQuestionClose(quizSession: QuizSessions, sessionId: number): void {
  // calculate the index of the questions array
  const index = quizSession.atQuestion - 1;
  const duration = quizSession.quiz.questions[index].duration;

  const timeoutId = setTimeout(() => {
    const data = getData();
    quizSession.state = QuizSessionState.QUESTION_CLOSE;
    endOfQuestionUpdates(quizSession);
    setData(data);

    const index = sessionIdToTimerArray.findIndex(t => t.timeoutId === timeoutId);
    clearTimeout(timeoutId);
    sessionIdToTimerArray.splice(index, 1);
  }, duration * 1000);

  // time of duration start
  quizSession.questionOpenTime = currentTime();

  sessionIdToTimerArray.push({ sessionId: sessionId, timeoutId: timeoutId });
}

/**
 * Generates data for a player including scores and ranks for csv results file
 *
 * @param {UsersRanking} player
 * @param {QuestionResults[]} questionResults
 * @param {QuizSessions} quizSession
 * @returns {Object}
 */
export function generatePlayerData(player: UsersRanking, questionResults: QuestionResults[], quizSession: QuizSessions): PlayerResultsData {
  const playerData: PlayerResultsData = { name: player.name };
  questionResults.forEach((_result, index) => {
    const playerResultIndex = _result.userRankingForQuestion.findIndex((pr) => pr.playerId === player.playerId);

    if (playerResultIndex !== -1) {
      const playerResult = _result.userRankingForQuestion[playerResultIndex];

      // Assigning the score
      playerData[`question${index + 1}score`] = playerResult.score;

      // Finding the rank
      const rank = playerResultIndex + 1;
      playerData[`question${index + 1}rank`] = rank;
    } else {
      playerData[`question${index + 1}score`] = 0;
      playerData[`question${index + 1}rank`] = null;
    }
  });

  return playerData;
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
      userRankingForQuestion: []
    };
    questionResults.push(newQuestion);
  }

  return questionResults;
}

/**
 * calculate averageAnswerTime and percentCorrect after a question has finished
 *
 * @param {QuestionResults} questionResults
 * @param {number} totalPlayers
 * @returns {void}
 */
export function updateQuestionResults(quizSession: QuizSessions, questionResults: QuestionResults): void {
  // calculating average answer time (to the nearest second)
  const answerTimeSum = questionResults.playersAnsweredList.reduce((sum, player) => sum + player.answerTime, 0);
  questionResults.averageAnswerTime = Math.round(answerTimeSum / questionResults.playersAnsweredList.length);

  // calculating percent correct (to the nearest whole number)
  const totalPlayers = quizSession.players.length;
  questionResults.percentCorrect = Math.round((questionResults.playersCorrectList.length / totalPlayers) * 100);

  // creating userRankingForQuestionArray
  for (const player of quizSession.players) {
    // checking if player in the session has answered to see their score
    const playerResults = questionResults.playersAnsweredList.find(p => p.playerId === player.playerId);
    let playerScore;
    if (playerResults === undefined) {
      playerScore = 0;
    } else {
      playerScore = playerResults.score;
    }

    questionResults.userRankingForQuestion.push({
      playerId: player.playerId,
      name: findNameByPlayerId(player.playerId),
      score: playerScore
    });
  }
  // sorting the rankings in descending order by score.
  questionResults.userRankingForQuestion.sort((a, b) => b.score - a.score);
}

/**
 * Update every players' total score and the overall ranking for the session
 * after a question has finished
 *
 * @param {UsersRanking[]} usersRankedByScore
 * @param {PlayerAnswered[]} playersAnswered
 * @returns {void}
 */
export function updateUsersRanking(usersRankedByScore: UsersRanking[], playersAnswered: PlayerAnswered[]): void {
  // first updating every player's score after the question
  for (const user of usersRankedByScore) {
    const player = playersAnswered.find(p => p.playerId === user.playerId);
    // if they answered, adding their score (0 or points) to their final score
    if (player !== undefined) {
      user.score += player.score;
    }
  }

  // updating usersRankedByScore to be in descending order by score
  usersRankedByScore.sort((a, b) => b.score - a.score);
}

/**
 * Find the questionResults for the question that just ended and update its
 * fields as well as update usersRankedByScore to ensure it is in descending
 * order by score
 *
 * @param {QuizSessions} quizSession
 * @returns {void}
 */
export function endOfQuestionUpdates(quizSession: QuizSessions): void {
  if (!quizSession.resultsUpdated) {
    // get questionResults info for question that just finished
    const currentQuestionResults = quizSession.questionResults[quizSession.atQuestion - 1];

    // updating questionResults and usersRankedByScore at the end of a question
    updateQuestionResults(quizSession, currentQuestionResults);
    updateUsersRanking(quizSession.usersRankedByScore, currentQuestionResults.playersAnsweredList);

    quizSession.resultsUpdated = true;
  }
}
