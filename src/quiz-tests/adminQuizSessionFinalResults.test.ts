// includes http tests for the route /v1/admin/quiz/{quizid}/session/{sessionid}/results

import sleepSync from 'slync';
import { requestGet, requestDelete, requestPost, requestPut } from '../helper-files/requestHelper';
import { QuestionBody, QuizSessionAction } from '../quiz';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/admin/quiz/{quizid}/session/{sessionid}/results', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let questionBody: QuestionBody;
  let questionIds: number[];
  let sessionStartBody: { autoStartNum: number };
  let sessionId: number;
  let playerId: number;
  let correctAnsIds: number[];
  let incorrectAnsIds: number[];
  let questionPosistion: number;

  beforeEach(() => {
    // register user
    userBody = { email: 'valid@gmail.com', password: 'Password123', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerRes = requestPost(userBody, '/v1/admin/auth/register');
    token = registerRes.retval.token;

    // create a quiz
    quizBody = { name: 'Quiz Name', description: 'Valid quiz description' };
    const quizRes = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizRes.retval.quizId;

    // create a question
    questionBody = {
      question: 'Who is your favourite artist\'s favourite artist?',
      duration: 4,
      points: 9,
      answers: [
        { answer: 'Chappell Roan', correct: true },
        { answer: 'Sabrina Carpenter', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/file/path.png'
    };

    const questionRes = requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });
    questionIds = [];
    questionIds.push(questionRes.retval.questionId);

    // get the answer IDs for the question answers
    const quizInfo = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
    correctAnsIds = [];
    incorrectAnsIds = [];
    correctAnsIds.push(quizInfo.retval.questions[0].answers[0].answerId);
    incorrectAnsIds.push(quizInfo.retval.questions[0].answers[1].answerId);

    // start a session i.e. state = LOBBY
    sessionStartBody = { autoStartNum: 4 };
    const sessionStartRes = requestPost(sessionStartBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionStartRes.retval.sessionId;
    questionPosistion = 1;

    // have a player join the session
    const playerJoinRes = requestPost({ sessionId: sessionId, name: 'Jane' }, '/v1/player/join');
    playerId = playerJoinRes.retval.playerId;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has the correct return type with one player and one question', () => {
      // update state to QUESTION_OPEN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // player submits answer
      requestPut({ answerIds: [correctAnsIds[0]] }, `/v1/player/${playerId}/question/${questionPosistion}/answer`);

      // sets state to FINAL_RESULTS
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const sessionFinalRes = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, { token });
      expect(sessionFinalRes).toStrictEqual({
        retval: {
          usersRankedByScore: [
            {
              name: 'Jane',
              score: 9,
            }
          ],
          questionResults: [
            {
              questionId: questionIds[0],
              playersCorrectList: [
                'Jane'
              ],
              averageAnswerTime: expect.any(Number),
              percentCorrect: 100,
            }
          ]
        },
        statusCode: 200,
      });
    });

    test('Has the correct return type with multiple players and multiple questions', () => {
      // create a second question
      questionBody = {
        question: 'Who is the Monarch of England',
        duration: 5,
        points: 5,
        answers: [
          { answer: 'Prince Charles', correct: true },
          { answer: 'Prince William', correct: false }
        ],
        thumbnailUrl: 'http://google.com/some/file/path.png'
      };
      // get questionId
      const questionRes = requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });
      questionIds.push(questionRes.retval.questionId);

      // qet answerIds for the correct and incorrect ans
      const quizInfoRes = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
      correctAnsIds.push(quizInfoRes.retval.questions[1].answers[0].answerId);
      incorrectAnsIds.push(quizInfoRes.retval.questions[1].answers[1].answerId);

      // start new session in LOBBY states
      sessionStartBody = { autoStartNum: 4 };
      const sessionRes = requestPost(sessionStartBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      const newSessionId = sessionRes.retval.sessionId;
      questionPosistion = 1;

      // multiple players join
      playerId = requestPost({ sessionId: newSessionId, name: 'John' }, '/v1/player/join').retval.playerId;
      const playerId2 = requestPost({ sessionId: newSessionId, name: 'Charli' }, '/v1/player/join').retval.playerId;
      const playerId3 = requestPost({ sessionId: newSessionId, name: 'Wendy' }, '/v1/player/join').retval.playerId;

      // update state to QUESTION_OPEN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });

      // submit answers for first question
      requestPut({ answerIds: [incorrectAnsIds[0]] }, `/v1/player/${playerId}/question/${questionPosistion}/answer`);
      requestPut({ answerIds: [correctAnsIds[0]] }, `/v1/player/${playerId2}/question/${questionPosistion}/answer`);
      requestPut({ answerIds: [correctAnsIds[0]] }, `/v1/player/${playerId3}/question/${questionPosistion}/answer`);

      // move to the next question
      questionPosistion = 2;

      // update state to QUESTION_OPEN
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });

      // submit next answers
      requestPut({ answerIds: [incorrectAnsIds[1]] }, `/v1/player/${playerId}/question/${questionPosistion}/answer`);
      requestPut({ answerIds: [incorrectAnsIds[1]] }, `/v1/player/${playerId2}/question/${questionPosistion}/answer`);
      requestPut({ answerIds: [correctAnsIds[1]] }, `/v1/player/${playerId3}/question/${questionPosistion}/answer`);

      // sets state to FINAL_RESULTS
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });
      requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });

      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${newSessionId}/results`, { token });
      expect(res).toStrictEqual({
        retval: {
          usersRankedByScore: [
            {
              name: 'Wendy',
              score: 14
            },
            {
              name: 'Charli',
              score: 9
            },
            {
              name: 'John',
              score: 0,
            }
          ],
          questionResults: [
            {
              questionId: questionIds[0],
              playersCorrectList: [
                'Charli', 'Wendy'
              ],
              averageAnswerTime: expect.any(Number),
              percentCorrect: 67,
            },
            {
              questionId: questionIds[1],
              playersCorrectList: [
                'Wendy'
              ],
              averageAnswerTime: expect.any(Number),
              percentCorrect: 33,
            }
          ]
        },
        statusCode: 200,
      });
    });

    test('Side-effect: Correctly lists usersRankedByScore in descending order with multiple players', () => {
      // two more players join
      const playerId2 = requestPost({ sessionId: sessionId, name: 'Charli' }, '/v1/player/join').retval.playerId;
      const playerId3 = requestPost({ sessionId: sessionId, name: 'Wendy' }, '/v1/player/join').retval.playerId;

      // update state to QUESTION_OPEN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // players submit answers
      requestPut({ answerIds: [incorrectAnsIds[0]] }, `/v1/player/${playerId}/question/${questionPosistion}/answer`);
      requestPut({ answerIds: [correctAnsIds[0]] }, `/v1/player/${playerId2}/question/${questionPosistion}/answer`);
      requestPut({ answerIds: [correctAnsIds[0]] }, `/v1/player/${playerId3}/question/${questionPosistion}/answer`);

      // update state to FINAL_RESULTS
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, { token });
      expect(res).toStrictEqual({
        retval: {
          usersRankedByScore: [
            {
              name: 'Charli',
              score: 9
            },
            {
              name: 'Wendy',
              score: 5
            },
            {
              name: 'Jane',
              score: 0
            }
          ],
          questionResults: [
            {
              questionId: questionIds[0],
              playersCorrectList: [
                'Charli', 'Wendy'
              ],
              averageAnswerTime: expect.any(Number),
              percentCorrect: 67,
            }
          ]
        },
        statusCode: 200,
      });
    });

    test('Side-effect: The averageAnswerTime is correctly calculated', () => {
      // update state to QUESTION_OPEN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // player submits answer after 2 seconds
      sleepSync(2000);
      requestPut({ answerIds: [correctAnsIds[0]] }, `/v1/player/${playerId}/question/${questionPosistion}/answer`);

      // sets state to FINAL_RESULTS
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, { token });
      expect(res).toStrictEqual({
        retval: {
          usersRankedByScore: [
            {
              name: 'Jane',
              score: 9,
            }
          ],
          questionResults: [
            {
              questionId: questionIds[0],
              playersCorrectList: [
                'Jane'
              ],
              averageAnswerTime: 2,
              percentCorrect: 100,
            }
          ]
        },
        statusCode: 200
      });
    });
  });

  describe('Testing errors in sessionId and quiz session state (status code 400)', () => {
    test('The session Id does not refer to a valid session within this quiz', () => {
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId + 1}/results`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('The session is not in FINAL_RESULTS state', () => {
      // make session go to END state
      requestPut({ action: QuizSessionAction.END }, `/v1/admin/quiz/${quizId}/session${sessionId}`, { token });

      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('The token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('The token is invalid (does not refer to a valid logged in user)', () => {
      const invalidToken = parseInt(token) + 1;
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, { token: invalidToken.toString() });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });

  describe('Testing quiz ownership and quiz existence errors (status code 403)', () => {
    test('The user is not an owner of this quiz', () => {
      const userBody2 = { email: 'email@gmail.com', password: 'validpa55w0rd', nameFirst: 'Betty', nameLast: 'Smith' };
      const user2Res = requestPost(userBody2, '/v1/admin/auth/register');
      token = user2Res.retval.token;

      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });

    test('The quiz does not exist', () => {
      const res = requestGet({}, `/v1/admin/quiz/${quizId + 1}/session/${sessionId}/results`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });
  });
});
