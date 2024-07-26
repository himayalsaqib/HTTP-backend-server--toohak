// includes http tests for the route /v1/admin/quiz/{quizid}/session/{sessionid}/results

import { requestGet, requestDelete, requestPost, requestPut } from "../helper-files/requestHelper";
import { QuestionBody, QuizSessionAction } from "../quiz";

const ERROR = expect.any(String);

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/admin/quiz/{quizid}/session/{sessionid}/results', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let questionBody: QuestionBody;
  let questionId: number;
  let sessionStartBody: { autoStartNum: number };
  let sessionId: number;
  let updateActionBody: { action: string };

  beforeEach(() => {
    // register user
    userBody = { email: 'valid@gmail.com', password: 'Password123', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerRes = requestPost(userBody, '/v1/admin/auth/register');
    token = registerRes.retval.token;

    // create a quiz
    quizBody = { name: 'Quiz Name', description: 'Valid quiz description' };
    const quizRes = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizRes.retval.quizId;

    // question a question
    questionBody = {
      question: 'Who is your favourite artist\'s favourite artist?',
      duration: 7,
      points: 9,
      answers: [
        { answer: 'Chappell Roan', correct: true },
        { answer: 'Sabrina Carpenter', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/file/path.png'
    };

    const questionRes = requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId = questionRes.retval.questionId;

    // start a session i.e. state = LOBBY
    sessionStartBody = { autoStartNum: 4 };
    const sessionStartRes = requestPost(sessionStartBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionStartRes.retval.sessionId;

    // have a player join the session
    requestPost({ sessionId: sessionId, name: 'Jane' }, '/v1/player/join');

    // update state to FINAL_RESULTS
    requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
    requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
    
    // player submits answer

    requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
    requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
  })
  
  describe.skip('Testing successful cases (status code 200)', () => {
    test('Has the correct return type with one player', () => {
      const sessionFinalRes = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, { token });
      expect(sessionFinalRes).toStrictEqual({
        retval: {
          usersRankedByScore: [
            {
              name: 'Jane',
              score: expect.any(Number),
            }
          ],
          questionResults: [
            {
              questionId: questionId,
              playersCorrectList: [],
              averageAnswerTime: expect.any(Number),
              percentCorrect: expect.any(Number),
            }
          ]
        },
        statusCode: 200
      }); 
    });

    test('Side-effect: Correctly lists usersRankedByScore in descending order with multiple players', () => {
      // 
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
