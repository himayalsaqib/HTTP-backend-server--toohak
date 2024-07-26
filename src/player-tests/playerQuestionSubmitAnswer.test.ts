// includes http tests for the route /v1/player/{playerid}/question/{questionposition}/answer

import { requestDelete, requestPost, requestPut } from '../helper-files/requestHelper';
import { QuestionBody, QuizSessionAction } from '../quiz';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('PUT /v1/player/{playerid}/question/{questionposition}/answer', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let createQuestionBody: { questionBody: QuestionBody };
  let sessionId: number;
  let playerId: number;
  //let player2Id: number;
  let updateActionBody: { action: string };

  beforeEach(() => {
    // Registering a user
    userBody = { email: 'valid1@example.com', password: 'Password123', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    // Creating a quiz
    quizBody = { name: 'Sample Quiz', description: 'Quiz Description' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;

    // Creating 1 quiz question
    const answerBody1 = { answer: 'Prince Charles', correct: true, answerId: 1234};
    const answerBody2 = { answer: 'Prince William', correct: false, answerId: 4321 };
    const answerBody3 = { answer: 'Prince Harry', correct: false, answerId: 2345 };
    createQuestionBody = {
      questionBody: {
        question: 'Who is the Monarch of England?',
        duration: 5,
        points: 5,
        answers: [answerBody1, answerBody2, answerBody3],
        thumbnailUrl: 'http://example.com/image.png'
      }
    };
    requestPost(createQuestionBody, `/v2/admin/quiz/${quizId}/question`, { token });

    // Starting a quiz session
    const startSessionResponse = requestPost({}, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = startSessionResponse.retval.sessionId;

    // Player joins the session
    const playerBody = { sessionId: sessionId, name: 'Player One' };
    const playerJoinResponse = requestPost(playerBody, '/v1/player/join');
    playerId = playerJoinResponse.retval.playerId;
  })

  describe('Testing successful cases (status code 200)', () => {
    test('Correct return type after submiting 1 answer', () => {
      const submitAns = { answerIds: [1234] };
      const questionPosition = 1;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual({});
      expect(res.statusCode).toStrictEqual(200);
    })

    test('Correct return type after re-submitting answer', () => {
      const submitAns = { answerIds: [1234] };
      const questionPosition = 1;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual({});
      expect(res.statusCode).toStrictEqual(200);

      const reSubmitAns = { answerIds: [4321] };
      const newRes = requestPut(reSubmitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(newRes.retval).toStrictEqual({});
      expect(newRes.statusCode).toStrictEqual(200);
    })

    test('Correct return type after submiting multiple answers', () => {
      const submitAns = { answerIds: [1234, 2345] };
      const questionPosition = 1;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual({});
      expect(res.statusCode).toStrictEqual(200);
    })

  })

  describe('Testing error cases (status code 400', () => {
    test('Returns errors for invalid player id', () => {
      const submitAns = { answerIds: [1234] };
      const questionPosition = 1;
      const invalidPlayerId = playerId + 1;
      const res = requestPut(submitAns, `/v1/player/${invalidPlayerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error for invalid question position', () => {
      const submitAns = { answerIds: [1234] };
      const invalidQuestionPosition = 100; 
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${invalidQuestionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error when session is not in QUESTION_OPEN state', () => {
      const submitAns = { answerIds: [1234] };
      const questionPosition = 1;

      // Session state changed
      updateActionBody = { action: QuizSessionAction.NEXT_QUESTION };
      requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error for invalid answer id', () => {
      const submitAns = { answerIds: [9999] }; 
      const questionPosition = 1;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error for duplicate answer id', () => {
      const submitAns = { answerIds: [1234, 1234] };
      const questionPosition = 1;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error when less than 1 answer id submitted', () => {
      const submitAns: { answerIds: number[] } = { answerIds: [] };
      const questionPosition = 1;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error when session is not currently on this question', () => {

    })
  })
});