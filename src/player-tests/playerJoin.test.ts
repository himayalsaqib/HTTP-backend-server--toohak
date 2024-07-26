// contains HTTP tests for route POST /v1/player/join

import { requestDelete, requestPost, requestGet } from '../helper-files/requestHelper';
import { QuestionBody } from '../quiz';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/player/join', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let createBody: { questionBody: QuestionBody };
  let startSessionBody: { autoStartNum: number };
  let sessionId: number;
  let playerBody: { sessionId: number, name: string };

  beforeEach(() => {
    // registering a user
    userBody = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
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

    // initialising body for start session route
    startSessionBody = { autoStartNum: 3 };
    const sessionResponse = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionResponse.retval.sessionId;
  });

  describe('Testing for correct return type (status code 200)', () => {
    test('Join with non-empty name', () => {
      playerBody = { sessionId: sessionId, name: 'JaneDoe' };
      const res = requestPost(playerBody, '/v1/player/join');
      expect(res).toStrictEqual({
        retval: {
          playerId: expect.any(Number),
        },
        statusCode: 200
      });
    });

    test('Join with empty name', () => {
      playerBody = { sessionId: sessionId, name: '' };
      const res = requestPost(playerBody, '/v1/player/join');
      expect(res).toStrictEqual({
        retval: {
          playerId: expect.any(Number),
        },
        statusCode: 200
      });
    });

    test('Side effect: adminQuizSessionStatus shows players joined', () => {
      playerBody = { sessionId: sessionId, name: 'JaneDoe' };
      requestPost(playerBody, '/v1/player/join');

      playerBody = { sessionId: sessionId, name: '' };
      requestPost(playerBody, '/v1/player/join');

      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(res.retval.players).toStrictEqual([
        'JaneDoe',
        expect.stringMatching(/^[a-zA-Z]{5}\d{3}$/)
      ]);
    });

    test('Side effect: adminQuizSessionStatus shows correct state after autoStartNum players joined', () => {
      playerBody = { sessionId: sessionId, name: 'JaneDoe' };
      requestPost(playerBody, '/v1/player/join');

      playerBody = { sessionId: sessionId, name: '' };
      requestPost(playerBody, '/v1/player/join');

      playerBody = { sessionId: sessionId, name: 'JohnDoe' };
      requestPost(playerBody, '/v1/player/join');

      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(res.retval.state).toStrictEqual('QUESTION_COUNTDOWN');
    });
  });

  describe('Testing for error cases (status code 400)', () => {
    test('Join with non-unique name', () => {
      playerBody = { sessionId: sessionId, name: 'JaneDoe' };
      requestPost(playerBody, '/v1/player/join');
      const res = requestPost(playerBody, '/v1/player/join');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Join with invalid session ID', () => {
      playerBody = { sessionId: sessionId + 1, name: 'JaneDoe' };
      const res = requestPost(playerBody, '/v1/player/join');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Join when session is not in LOBBY state', () => {
      // 3 players join to autoStart - move from LOBBY to QUESTION_COUNTDOWN state
      playerBody = { sessionId: sessionId, name: 'JaneDoe' };
      requestPost(playerBody, '/v1/player/join');

      playerBody = { sessionId: sessionId, name: '' };
      requestPost(playerBody, '/v1/player/join');

      playerBody = { sessionId: sessionId, name: 'JohnDoe' };
      requestPost(playerBody, '/v1/player/join');

      // Attempt to join player while not in LOBBY state
      playerBody = { sessionId: sessionId, name: 'Joe' };
      requestPost({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/start`, { token });
      const res = requestPost(playerBody, '/v1/player/join');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });
});
