// inlcudes http tests for the route /v1/admin/quiz/{quizid}/session/{sessionid}

import { requestPut, requestDelete, requestPost, requestGet } from "../helper-files/requestHelper";
import { QuestionBody, QuizSessionAction, QuizSessionState } from "../quiz";

beforeEach(() => {
  requestDelete({}, '/v1/clear');
})

const ERROR = { error: expect.any(String) };

describe('PUT /v1/admin/quiz/{quizid}/session/{sessionid}', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let questionBody: { questionBody: QuestionBody };
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
      questionBody: {
        question: 'Who is your favourite artist\'s favourite artist?',
        duration: 7,
        points: 9,
        answers: [
          { answer: 'Chappell Roan', correct: true },
          { answer: 'Sabrina Carpenter', correct: false }
        ],
        thumbnailUrl: 'http://google.com/some/file/path.png'
      }
    };
    const questionRes = requestPost(questionBody, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId = questionRes.retval.questionId;

    // start a session
    sessionStartBody = { autoStartNum: 3 };
    const sessionStartRes = requestPost(sessionStartBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionStartRes.retval.sessionId;
    
    // initalising updateActionBody for route
    updateActionBody = { action: QuizSessionAction.NEXT_QUESTION };
  });

  describe('Testing successful quiz session state update (status code 200)', () => {
    test('Has the correct return type', () => {
      const sessionUpdateRes = requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(sessionUpdateRes).toStrictEqual({
        retval: {},
        statusCode: 200
      });
    });

    test.skip('Side-effect: status changes when get adminQuizSessionStatusView has been called', () => {
      const beforeUpdate = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(beforeUpdate.retval.state).toStrictEqual({ state: QuizSessionState.LOBBY });


      const updateRes = requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(updateRes).toStrictEqual({
        retval: {}, 
        statusCode: 200
      });

      const afterUpdate = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(afterUpdate.retval.state).toStrictEqual({ state: QuizSessionState.QUESTION_COUNTDOWN });
    });
  });

  describe('Testing session ID and action enum errors (status code 400)', () => {
    test('The session ID does not refer to a valid session within the quiz', () => {
      const updateRes = requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId + 1}`, { token });
      expect(updateRes).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('The action provided is not a valid Action enum', () => {
      updateActionBody = { action: 'NOT_AN_ACTION' };
      
      const updateRes = requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(updateRes).toStrictEqual({
        retval: ERROR, 
        statusCode: 400
      });
    });

    test('The Action enum cannot be applied in the current state', () => {
      updateActionBody = { action: QuizSessionAction.SKIP_COUNTDOWN };
      const updateRes = requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(updateRes).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });
  });

  describe('Testing token errors (status 401)', () => {
    test('Token is empty (when no users are registered', () => {
      requestDelete({}, '/v1/clear');
      const statusUpdateRes = requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(statusUpdateRes).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Token is invalid (does not refer to a valid logged in user session)', () => {
      sessionId = parseInt(token) + 1;
      const updateRes = requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(updateRes).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });

  describe('Testing quiz ownership and quiz existence errors (status code 403)', () => {
    test('The user is not an owner of this quiz', () => {
      const userBody2 = { email: 'email@gmail.com', password: 'validpa55w0rd', nameFirst: 'Betty', nameLast: 'Smith' };
      const user2Res = requestPost(userBody2, '/v1/admin/auth/register')
      token = user2Res.retval.token;

      const updateRes = requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(updateRes).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      })
    });

    test('This quiz does not exist', () => {
      const updateRes = requestPut(updateActionBody, `/v1/admin/quiz/${quizId + 1}/session/${sessionId}`, { token });
      expect(updateRes).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });
  });
});