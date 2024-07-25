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
  let questionBody: { questionBody: QuestionBody };
  let sessionId: number;
  let playerBody: { sessionId: number, name: string };
  let playerId: number;
  // let playerId2: number;
  // let playerId3: number;
  let updateActionBody: { action: string };

  beforeEach(() => {
    // Registering user
    userBody = { email: 'test@example.com', password: 'Password123', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    // Creating a quiz
    quizBody = { name: 'Sample Quiz', description: 'Sample Description' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;

    // Creating a quiz question
    questionBody = {
      questionBody: {
        question: 'What is the capital of France?',
        duration: 10,
        points: 10,
        answers: [
          { answer: 'Paris', correct: true },
          { answer: 'London', correct: false }
        ],
        thumbnailUrl: 'http://example.com/image.png'
      }

    };
    requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });

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
      const status = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      const questionInfo = requestGet({ token: token }, `/v1/admin/quiz/${quizId}`);
      console.log(res);
      expect(res).toStrictEqual({
        retval: {
          state: status.retval.state,
          numQuestions: questionInfo.retval.numQuestions,
          atQuestion: expect.any(Number)
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
          state: 'QUESTION_COUNTDOWN',
          numQuestions: 1,
          atQuestion: 1,
        },
        statusCode: 200,
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
