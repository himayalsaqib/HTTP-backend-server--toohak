// contains HTTP tests for route POST /v1/player/join

import { requestDelete, requestPost, requestPut, requestGet} from '../helper-files/requestHelper';
import { QuestionBody, QuizSessionState } from '../quiz';

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
  let questionId: number;
  let startSessionBody: { autoStartNum: number };
  let sessionId: number;
  let playerBody: { sessionId: number, name: string };
  let updateActionBody: { action: string };
  // let playerId: number;

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
    const createResponse = requestPost(createBody, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId = createResponse.retval.questionId;

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
      // name: expect.stringMatching(/^[a-zA-Z]{5}\d{3}$/) // Matches pattern [5 letters][3 numbers]
      const res = requestPost(playerBody, '/v1/player/join');
      expect(res).toStrictEqual({
        retval: {
          playerId: expect.any(Number),
        },
        statusCode: 200
      });
    });

    test.skip('Side effect: adminQuizSessionStatus shows players joined', () => {
      playerBody = { sessionId: sessionId, name: 'JaneDoe' };
      requestPost(playerBody, '/v1/player/join');

      playerBody = { sessionId: sessionId, name: '' };
      requestPost(playerBody, '/v1/player/join');

      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(res.retval).toStrictEqual({
        state: QuizSessionState.LOBBY,
        atQuestion: 1,
        players: [
          'JaneDoe',
          expect.stringMatching(/^[a-zA-Z]{5}\d{3}$/),
        ],
        metadata: {
          quizId: quizId,
          name: quizBody.name,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: quizBody.description,
          numQuestions: 1,
          questions: [
            {
              questionId: questionId,
              question: createBody.questionBody.question,
              duration: createBody.questionBody.duration,
              thumbnailUrl: createBody.questionBody.thumbnailUrl,
              points: createBody.questionBody.points,
              answers: [
                { answerId: expect.any(Number), answer: 'Prince Charles', colour: expect.any(String), correct: true },
                { answerId: expect.any(Number), answer: 'Prince William', colour: expect.any(String), correct: false }
              ]
            }
          ],
          duration: createBody.questionBody.duration,
          thumbnailUrl: createBody.questionBody.thumbnailUrl
        }
      });
    });
  });

  describe('Testing for error cases (status code 400)', () => {
    test('Join with non-unique name', () => {
      playerBody = { sessionId: sessionId, name: 'JaneDoe' };
      requestPost(playerBody, '/v1/player/join');
      // Attempt to join with the same name
      const res = requestPost(playerBody, '/v1/player/join');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Join with invalid session ID', () => {
      playerBody = { sessionId: sessionId + 1, name: 'JaneDoe' };
      const res = requestPost(playerBody, '/v1/player/join');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test.skip('Join when session is not in LOBBY state', () => {
      // make state: QuizSessionState.QUESTION_COUNTDOWN
      requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      playerBody = { sessionId: sessionId, name: 'JaneDoe' };
      requestPost({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/start`, { token });
      const res = requestPost({ playerBody }, '/v1/player/join');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });
});
