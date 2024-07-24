// includes http tests for the route POST /v1/admin/quiz/{quizid}/session/start

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';
import { QuestionBody, QuizSessionState } from '../quiz';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

const ERROR = { error: expect.any(String) };

describe('POST /v1/admin/quiz/{quizid}/session/start', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let questionBody: QuestionBody;
  let questionId: number;
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
    const questionResponse = requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId = questionResponse.retval.questionId;

    // initialising body for start session route
    startSessionBody = { autoStartNum: 3 };
  });

  describe('Testing successful quiz session start (status code 200)', () => {
    test('Has the correct return type', () => {
      const res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      expect(res).toStrictEqual({
        retval: { sessionId: expect.any(Number) },
        statusCode: 200
      });
    });

    test.skip('Side effect: adminQuizViewAllSessions shows new session in activeSessions array', () => {
      let res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      expect(res).toStrictEqual({ retval: { sessionId: expect.any(Number) }, statusCode: 200 });
      const sessionId = res.retval.sessionId;

      res = requestGet({}, `/v1/admin/quiz/${quizId}/sessions`, { token });
      expect(res).toStrictEqual({
        retval: {
          activeSessions: [sessionId],
          inactiveSessions: []
        },
        statusCode: 200
      });
    });

    test.skip('Side effect: adminQuizSessionStatus shows status of new quiz session', () => {
      let res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      expect(res).toStrictEqual({ retval: { sessionId: expect.any(Number) }, statusCode: 200 });
      const sessionId = res.retval.sessionId;

      // not implemented yet
      res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      expect(res.retval).toStrictEqual({
        state: QuizSessionState.LOBBY,
        atQuestion: 1,
        players: [],
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
              question: questionBody.question,
              duration: questionBody.duration,
              thumbnailUrl: questionBody.thumbnailUrl,
              points: questionBody.points,
              answers: [
                { answerId: expect.any(Number), answer: 'Prince Charles', colour: expect.any(String), correct: true },
                { answerId: expect.any(Number), answer: 'Prince William', colour: expect.any(String), correct: false }
              ]
            }
          ],
          duration: questionBody.duration,
          thumbnailUrl: questionBody.thumbnailUrl
        }
      });
      expect(res.statusCode).toStrictEqual(200);
    });
  });

  describe('Testing autoStartNum, quiz session and valid quiz errors (status code 400)', () => {
    test('AutoStartNum is greater than 50', () => {
      startSessionBody.autoStartNum = 51;
      const res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('10 sessions not in END state currently exist for this quiz', () => {
      // start 10 sessions for quiz
      let res;
      for (let i = 0; i < 10; i++) {
        res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
        expect(res).toStrictEqual({ retval: { sessionId: expect.any(Number) }, statusCode: 200 });
      }

      // starting 11th session gives an error
      res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('The Quiz does not have any questions in it', () => {
      // deleting existing question
      requestDelete({}, `/v2/admin/quiz/${quizId}/question/${questionId}`, { token });

      const res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('The quiz is in trash', () => {
      // moving quiz to trash
      requestDelete({}, `/v2/admin/quiz/${quizId}`, { token });

      const res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Returns error when token is empty', () => {
      requestDelete({}, '/v1/clear');
      const res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Returns error when sessionId is not a valid user session', () => {
      const sessionId = parseInt(token) + 1;
      const res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token: sessionId.toString() });
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

      const res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });

    test('Returns error when quiz doesn\'t exist', () => {
      const res = requestPost(startSessionBody, `/v1/admin/quiz/${quizId + 1}/session/start`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });
  });
});
