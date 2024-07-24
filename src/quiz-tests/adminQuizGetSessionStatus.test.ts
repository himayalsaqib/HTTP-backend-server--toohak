// includes http tests for the route /v1/admin/quiz/{quizid}/session/{sessionid}

import { requestGet, requestDelete, requestPost, requestPut } from '../helper-files/requestHelper';
import { QuestionBody } from '../quiz';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

const ERROR = { error: expect.any(String) };

describe('GET /v1/admin/quiz/{quiz}/session/{sessionid}', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let questionBody: QuestionBody;
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

    requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });

    // start a session
    sessionStartBody = { autoStartNum: 3 };
    const sessionStartRes = requestPost(sessionStartBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionStartRes.retval.sessionId;

    // initalising updateActionBody
    updateActionBody = { action: 'NEXT_QUESTION' };

    // have a player join the session
    requestPost({ sessionId: sessionId, name: 'Jane' }, '/v1/player/join');
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has the correct return type', () => {
      const getStatusRes = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(getStatusRes).toStrictEqual({
        retval: {
          state: 'LOBBY',
          atQuestion: 0,
          players: [
            'Jane'
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
                questionId: expect.any(Number),
                question: questionBody.question,
                duration: questionBody.duration,
                thumbnailUrl: questionBody.thumbnailUrl,
                points: expect.any(Number),
                answers: [
                  {
                    answerId: expect.any(Number),
                    answer: questionBody.answers[0].answer,
                    colour: expect.any(String),
                    correct: questionBody.answers[0].correct
                  }, {
                    answerId: expect.any(Number),
                    answer: questionBody.answers[1].answer,
                    colour: expect.any(String),
                    correct: questionBody.answers[1].correct
                  }
                ]
              }
            ],
            duration: questionBody.duration,
            thumbnail: expect.any(String),
          }
        },
        statusCode: 200
      });
    });

    test.skip('Side-effect test: the correct status is shown when an action command is sent', () => {
      const stateUpdateRes = requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(stateUpdateRes).toStrictEqual({
        retval: {},
        statusCode: 200
      });

      const getSessionRes = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(getSessionRes).toStrictEqual({
        retval: {
          state: 'QUESTION_COUNTDOWN',
          atQuestion: 0,
          players: [
            'Jane'
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
                questionId: expect.any(Number),
                question: questionBody.question,
                duration: questionBody.duration,
                thumbnailUrl: questionBody.thumbnailUrl,
                points: expect.any(Number),
                answers: [
                  {
                    answerId: expect.any(Number),
                    answer: questionBody.answers[0].answer,
                    colour: expect.any(String),
                    correct: questionBody.answers[0].correct
                  }, {
                    answerId: expect.any(Number),
                    answer: questionBody.answers[1].answer,
                    colour: expect.any(String),
                    correct: questionBody.answers[1].correct
                  }
                ]
              }
            ],
            duration: questionBody.duration,
            thumbnail: expect.any(String),
          }
        },
        statusCode: 200,
      });
    });
  });

  describe('Testing session ID errors (status code 400)', () => {
    test('The session ID does not refer to a valid session within the quiz', () => {
      const getSessionRes = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId + 1}`, { token });
      expect(getSessionRes).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('The token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const getSessionRes = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(getSessionRes).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('The token is invalid (does not refer to a valid logged in user)', () => {
      const invalidToken = parseInt(token) + 1;
      const getSessionRes = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token: invalidToken.toString() });
      expect(getSessionRes).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });

  describe('Testing quiz ownership and quiz existence errors (status code 403)', () => {
    test('The user is not a owner of the quiz', () => {
      // register another user
      const user2 = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'John', nameLast: 'Smith' };
      const resRegister = requestPost(user2, '/v1/admin/auth/register');
      const token2 = resRegister.return.token;

      const statusRes = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token: token2 });
      expect(statusRes).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });

    test('This quiz does not exist', () => {
      const statusRes = requestGet({}, `/v1/admin/quiz/${quizId + 1}/session/${sessionId}`, { token });
      expect(statusRes).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });
  });
});
