// contains HTTP tests for route GET /v1/player/{playerid}/question/{questionposition}

import sleepSync from 'slync';
import { requestDelete, requestPost, requestPut, requestGet } from '../helper-files/requestHelper';
import { QuestionBody, QuizSessionAction } from '../quiz';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/player/:playerid/question/:questionposition', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let createBody: { questionBody: QuestionBody };
  let sessionId: number;
  let playerBody: { sessionId: number, name: string };
  let playerId: number;
  let questionId: number;
  let questionId2: number;

  beforeEach(() => {
    // registering a user
    userBody = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    // creating a quiz
    quizBody = { name: 'Quiz Name', description: 'Quiz description' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;

    // creating quiz question 1
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
    const questionResponse = requestPost(createBody, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId = questionResponse.retval.questionId;

    // creating quiz question 2
    createBody = {
      questionBody: {
        question: 'Which is the second largest city in Japan?',
        duration: 5,
        points: 5,
        answers: [
          { answer: 'Tokyo', correct: false },
          { answer: 'Osaka', correct: true },
          { answer: 'Kyoto', correct: false }
        ],
        thumbnailUrl: 'http://example.com/image2.png'
      }
    };
    const questionResponse2 = requestPost(createBody, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId2 = questionResponse2.retval.questionId;

    // start a quiz session
    const sessionResponse = requestPost({}, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionResponse.retval.sessionId;

    // player joins session
    playerBody = { sessionId: sessionId, name: 'JaneDoe' };
    const playerResponse = requestPost(playerBody, '/v1/player/join');
    playerId = playerResponse.retval.playerId;
  });

  describe('Testing for correct return type (status code 200)', () => {
    const questionposition = 1;

    beforeEach(() => {
    // Update updateActionBody to QUESTION_OPEN state
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
    });

    test('Has correct return type for player on QUESTION_OPEN STATE', () => {
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({
        retval: {
          questionId: questionId,
          question: 'Who is the Monarch of England?',
          duration: 5,
          thumbnailUrl: 'http://google.com/some/image/path.png',
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
            },
            {
              answerId: expect.any(Number),
              answer: 'Prince William',
              colour: expect.any(String),
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Has correct return type for player on QUESTION_CLOSE state', () => {
      const duration = createBody.questionBody.duration;
      sleepSync(duration * 1000);
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({
        retval: {
          questionId: questionId,
          question: 'Who is the Monarch of England?',
          duration: 5,
          thumbnailUrl: 'http://google.com/some/image/path.png',
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
            },
            {
              answerId: expect.any(Number),
              answer: 'Prince William',
              colour: expect.any(String),
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Has correct return type for player on ANSWER_SHOW state', () => {
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({
        retval: {
          questionId: questionId,
          question: 'Who is the Monarch of England?',
          duration: 5,
          thumbnailUrl: 'http://google.com/some/image/path.png',
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
            },
            {
              answerId: expect.any(Number),
              answer: 'Prince William',
              colour: expect.any(String),
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Has correct return type for player on a different question position', () => {
      const duration = createBody.questionBody.duration;
      sleepSync(duration * 1000);
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition + 1}`);
      expect(res).toStrictEqual({
        retval: {
          questionId: questionId2,
          question: 'Which is the second largest city in Japan?',
          duration: 5,
          thumbnailUrl: 'http://example.com/image2.png',
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Tokyo',
              colour: expect.any(String),
            },
            {
              answerId: expect.any(Number),
              answer: 'Osaka',
              colour: expect.any(String),
            },
            {
              answerId: expect.any(Number),
              answer: 'Kyoto',
              colour: expect.any(String),
            }
          ]
        },
        statusCode: 200
      });
    });
  });

  describe('Testing for error cases (status code 400)', () => {
    const questionposition = 1;
    beforeEach(() => {
    // Update updateActionBody to QUESTION_OPEN state
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
    });
    test('PlayerId does not exist', () => {
      const res = requestGet({}, `/v1/player/${playerId + 1}/question/${questionposition}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Question position is not valid for this session', () => {
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition + 10}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Session is not currently on this question', () => {
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition + 1}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing for session state error cases (status code 400)', () => {
    const questionposition = 1;

    test('Session is in LOBBY state', () => {
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Session is in QUESTION_COUNTDOWN state', () => {

      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Session is in FINAL_RESULTS state', () => {
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // update session state to ANSWER_SHOW
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // update to FINAL_RESULTS
      requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Session is in END state', () => {
      requestPut({ action: QuizSessionAction.END }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });
});
