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
  let questionBody: QuestionBody;
  let startSessionBody: { autoStartNum: number };
  let updateToEndState: { action: QuizSessionState};

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
    questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Prince William', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.png'
    };
    requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });

    startSessionBody = { autoStartNum: 3 };
    updateToEndState = { action: QuizSessionState.END };
  });

  describe('Testing for correct return type, successfully retrieves active and inactive sessionIds (status code 200)', () => {
    test('When quiz has no sessions (empty list)', () => {
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: { activeSessions: [], inactiveSessions: [] },
        statusCode: 200
      });
    });

    test('When quiz only has an active session', () => {
      // starting a new session
      let res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      const activeSessionId = res.retval.sessionId;

      res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: { activeSessions: [activeSessionId], inactiveSessions: [] },
        statusCode: 200
      });
    });

    test('When quiz only has an inactive session', () => {
      // starting a new session
      let res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      const inactiveSessionId = res.retval.sessionId;
      // making one session inactive by putting in END state
      requestPut(updateToEndState, `/v1/admin/quiz/${quizId}/session/${inactiveSessionId}`, { token });

      res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: { activeSessions: [], inactiveSessions: [inactiveSessionId] },
        statusCode: 200
      });
    });

    test('When quiz has 1 active and 1 inactive session', () => {
      // starting two new sessions
      let res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      const activeSessionId = res.retval.sessionId;

      res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      const inactiveSessionId = res.retval.sessionId;
      // making one session inactive by putting in END state
      requestPut(updateToEndState, `/v1/admin/quiz/${quizId}/session/${inactiveSessionId}`, { token });

      res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: { activeSessions: [activeSessionId], inactiveSessions: [inactiveSessionId] },
        statusCode: 200
      });
    });

    test('When quiz has multiple active and inactive sessions', () => {
      // starting four new sessions. 2 active and 2 inactive.
      let res; const activeSessionIds = []; const inactiveSessionIds = [];
      for (let i = 0; i < 2; i++) {
        res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
        activeSessionIds.push(res.retval.sessionId);

        res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
        inactiveSessionIds.push(res.retval.sessionId);

        // making this session inactive by putting in END state
        requestPut(updateToEndState, `/v1/admin/quiz/${quizId}/session/${inactiveSessionIds[i]}`, { token });
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
