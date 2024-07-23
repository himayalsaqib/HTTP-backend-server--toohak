// includes http tests for the route GET /v1/admin/quiz/{quizid}/sessions

import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';
import { QuestionBody, QuizSessionState } from '../quiz';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

const ERROR = { error: expect.any(String) };

describe('GET /v1/admin/quiz/{quizid}/sessions', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let createBody: { questionBody: QuestionBody };
  let startSessionBody: { autoStartNum: number };

  beforeEach(() => {
    // registering a user
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    // creating a quiz
    quizBody = { name: 'Quiz Name', description: 'Quiz description' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;

    // creating a quiz question
    createBody = {
      questionBody: {
        question: 'Who is the Monarch of England?',
        duration: 5,
        points: 5,
        answers: [
          { answer: 'Prince Charles', correct: true },
          { answer: 'Prince William', correct: false }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.png'
      }
    };
    requestPost(createBody, `/v2/admin/quiz/${quizId}/question`, { token });
  });

  describe('Testing for correct return type (status code 200)', () => {
    test('Successfully returns empty lists for active and inactive sessions when no sessions exist', () => {
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: { activeSessions: [], inactiveSessions: [] },
        statusCode: 200
      });
    });

    test('Successfully retrieves active and inactive session ids when only an active session exists', () => {
      // starting a new session
      startSessionBody = { autoStartNum: 3 };
      let res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      const activeSessionId = res.retval.sessionId;

      res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: { activeSessions: [activeSessionId], inactiveSessions: [] },
        statusCode: 200
      });
    });

    test.skip('Successfully retrieves active and inactive session ids when only an inactive session exists', () => {
      // starting a new session
      startSessionBody = { autoStartNum: 3 };
      let res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      const inactiveSessionId = res.retval.sessionId;
      // making one session inactive by putting in END state
      requestPut({ action: QuizSessionState.END }, `/v1/admin/quiz/${quizId}/session/${inactiveSessionId}`, { token });

      res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: { activeSessions: [], inactiveSessions: [inactiveSessionId] },
        statusCode: 200
      });
    });

    test.skip('Successfully retrieves active and inactive session ids when 1 active and inactive session exists', () => {
      // starting two new sessions
      startSessionBody = { autoStartNum: 3 };
      let res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      const activeSessionId = res.retval.sessionId;

      res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      const inactiveSessionId = res.retval.sessionId;
      // making one session inactive by putting in END state
      requestPut({ action: QuizSessionState.END }, `/v1/admin/quiz/${quizId}/session/${inactiveSessionId}`, { token });

      res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: { activeSessions: [activeSessionId], inactiveSessions: [inactiveSessionId] },
        statusCode: 200
      });
    });

    test.skip('Successfully retrieves active and inactive session ids when multiple active/inactive sessions exist', () => {
      // starting four new sessions. 2 active and 2 inactive.
      startSessionBody = { autoStartNum: 3 };
      let res, activeSessionIds: number[], inactiveSessionIds: number[];
      for (let i = 0; i < 2; i++) {
        res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
        activeSessionIds[i] = res.retval.sessionId;

        res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
        inactiveSessionIds[i] = res.retval.sessionId;
        // making this session inactive by putting in END state
        requestPut({ action: QuizSessionState.END }, `/v1/admin/quiz/${quizId}/session/${inactiveSessionIds[i]}`, { token });
      }

      res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: {
          activeSessions: activeSessionIds.sort((id1, id2) => id1 - id2),
          inactiveSessions: inactiveSessionIds.sort((id1, id2) => id1 - id2)
        },
        statusCode: 200
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Returns error when token is empty', () => {
      requestDelete({}, '/v1/clear');
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Returns error when sessionId is not a valid user session', () => {
      const sessionId = (parseInt(token) + 1).toString();
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token: sessionId });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });

  describe('Testing quizId errors (status code 403)', () => {
    test('Returns error when user is not an owner of the quiz', () => {
      const user2 = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'John', nameLast: 'Doe' };
      token = requestPost(user2, '/v1/admin/auth/register').retval.token;

      const res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });

    test('Returns error when quiz doesn\'t exist', () => {
      const res = requestGet({}, `/v1/admin/quiz/${quizId + 1}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });
  });
});
