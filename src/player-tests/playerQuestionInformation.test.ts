// contains HTTP tests for route GET /v1/player/{playerid}/question/{questionposition}

import sleepSync from 'slync';
import { requestDelete, requestPost, requestPut, requestGet } from '../helper-files/requestHelper';
import { QuestionBody, QuizSessionAction } from '../quiz';

const ERROR = { error: expect.any(String) };
const WAIT_THREE_SECONDS = 3;

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
  let updateActionBody: { action: string };
  let playerId: number;
  let questionposition: number;
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

    // initialising body for start session route
    startSessionBody = { autoStartNum: 2 };
    const sessionResponse = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionResponse.retval.sessionId;

    // player joins session
    playerBody = { sessionId: sessionId, name: 'JaneDoe' };
    const res = requestPost(playerBody, '/v1/player/join');
  });


  describe('Testing for correct return type (status code 200)', () => {
    // Update updateActionBody to QUESTION_OPEN state 
    updateActionBody = { action: QuizSessionAction.NEXT_QUESTION };
    requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
    updateActionBody = { action: QuizSessionAction.SKIP_COUNTDOWN };
    requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

    test('Has correct return type for player on QUESTION_OPEN STATE', () => {
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({
          "questionId": questionId,
          "question": "Who is the Monarch of England?",
          "duration": 5,
          "thumbnailUrl": 'http://google.com/some/image/path.png',
          "points": 5,
          "answers": [
            {
              "answerId": expect.any(Number),
              "answer": "Prince Charles",
              "colour": expect.any(String),
            }
          ]
      });
    });
    test('Has correct return type for player on diff state', () => {
      const duration = createBody.questionBody.duration;
      sleepSync(duration * 1000);
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({
          "questionId": questionId,
          "question": "Who is the Monarch of England?",
          "duration": 5,
          "thumbnailUrl": 'http://google.com/some/image/path.png',
          "points": 5,
          "answers": [
            {
              "answerId": expect.any(Number),
              "answer": "Prince Charles",
              "colour": expect.any(String),
            }
          ]
      });
    });

  });

  describe('Testing for error cases (status code 400)', () => {
    // Update updateActionBody to QUESTION_OPEN state 
    updateActionBody = { action: QuizSessionAction.NEXT_QUESTION };
    requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
    updateActionBody = { action: QuizSessionAction.SKIP_COUNTDOWN };
    requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

    test('PlayerId does not exist', () => {
      const res = requestGet({}, `/v1/player/${playerId + 1}/question/${questionposition}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Question position is not valid for this session', () => {
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition + 5}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Session is not currently on this question', () => {
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition + 1}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing for session state error cases (status code 400)', () => {
    test('Session is in LOBBY state', () => {
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
    test('Session is in QUESTION_COUNTDOWN state', () => {
      updateActionBody = { action: QuizSessionAction.NEXT_QUESTION };

      requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
    test('Session is in FINAL_RESULTS state', () => {
      updateActionBody = { action: QuizSessionAction.NEXT_QUESTION };
      requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      updateActionBody = { action: QuizSessionAction.SKIP_COUNTDOWN };
      requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // wait question duration to go to QUESTION_CLOSE
      const duration = createBody.questionBody.duration;
      sleepSync(duration * 1000);

      updateActionBody = { action: QuizSessionAction.GO_TO_FINAL_RESULTS };
      requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
    test('Session is in END state', () => {
      updateActionBody = { action: QuizSessionAction.END};
      requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });
});



