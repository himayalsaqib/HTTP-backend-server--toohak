// contains HTTP tests for route POST /v1/player/{playerid}

import { requestDelete, requestPost, requestPut, requestGet } from '../helper-files/requestHelper';
import { QuestionBody, QuizSessionAction } from '../quiz';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/player/{playerid}', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let createQuestionBody: { questionBody: QuestionBody };
  let sessionId: number;
  let playerBody: { sessionId: number, name: string };
  let playerId: number;
  let player2Id: number;
  let updateActionBody: { action: string };

  beforeEach(() => {
    // Registering user
    userBody = { email: 'valid1@example.com', password: 'Password123', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    // Creating a quiz
    quizBody = { name: 'Sample Quiz', description: 'Quiz Description' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;

    // Creating a quiz question
    createQuestionBody = {
      questionBody: {
        question: 'Who is the Monarch of England?',
        duration: 5,
        points: 5,
        answers: [
          { answer: 'Prince Charles', correct: true },
          { answer: 'Prince William', correct: false }
        ],
        thumbnailUrl: 'http://example.com/image.png'
      }

    };
    requestPost(createQuestionBody, `/v2/admin/quiz/${quizId}/question`, { token });

    // Starting a quiz session
    const sessionResponse = requestPost({}, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionResponse.retval.sessionId;

    // Player joins the session
    playerBody = { sessionId: sessionId, name: 'Player One' };
    const playerRes = requestPost(playerBody, '/v1/player/join');
    playerId = playerRes.retval.playerId;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Correct return type', () => {
      const res = requestGet({}, `/v1/player/${playerId}`);
      expect(res).toStrictEqual({
        retval: {
          state: res.retval.state,
          numQuestions: res.retval.numQuestions,
          atQuestion: res.retval.atQuestion
        },
        statusCode: 200
      });
    });

    test('Has correct return type after updating session state', () => {
      updateActionBody = { action: QuizSessionAction.NEXT_QUESTION };
      requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      const res = requestGet({}, `/v1/player/${playerId}`);
      expect(res).toStrictEqual({
        retval: {
          state: res.retval.state,
          numQuestions: res.retval.numQuestions,
          atQuestion: res.retval.atQuestion,
        },
        statusCode: 200,
      });
    });

    test('Correct return type when second player joins ', () => {
      const player2Body = { sessionId: sessionId, name: 'Player Two' };
      const player2Res = requestPost(player2Body, '/v1/player/join');
      player2Id = player2Res.retval.playerId;
      const res = requestGet({}, `/v1/player/${player2Id}`);
      expect(res).toStrictEqual({
        retval: {
          state: res.retval.state,
          numQuestions: res.retval.numQuestions,
          atQuestion: res.retval.atQuestion
        },
        statusCode: 200
      });
    });
  });

  describe('Testing player Id errors (status code 400)', () => {
    test('The player Id does not exist', () => {
      const invalidPlayerId = playerId + 1;
      const res = requestGet({}, `/v1/player/${invalidPlayerId}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });
});
