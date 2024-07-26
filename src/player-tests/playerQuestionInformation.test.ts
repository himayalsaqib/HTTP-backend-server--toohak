// contains HTTP tests for route GET /v1/player/{playerid}/question/{questionposition}

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
    const qeustionResponse = requestPost(createBody, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId = qeustionResponse.retval.questionId;

    // initialising body for start session route
    startSessionBody = { autoStartNum: 2 };
    const sessionResponse = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionResponse.retval.sessionId;

    // player joins session
    playerBody = { sessionId: sessionId, name: 'JaneDoe' };
    const res = requestPost(playerBody, '/v1/player/join');

    // initialising updateActionBody for route
    updateActionBody = { action: QuizSessionAction.NEXT_QUESTION };
    requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
    updateActionBody = { action: QuizSessionAction.SKIP_COUNTDOWN };
    requestPut(updateActionBody, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
  });


  describe('Testing for correct return type (status code 200)', () => {
    test('Has correct return type for player on Question 1', () => {
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionposition}`);
      expect(res).toStrictEqual({
          "questionId": questionId,
          "question": "Who is the Monarch of England?",
          "duration": 5,
          "thumbnailUrl": 'http://google.com/some/image/path.png',
          "points": 5,
          "answers": [
            {
              "answerId": res.retval.answerId,
              "answer": "Prince Charles",
              "colour": res.retval.colour,
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
              "answerId": res.retval.answerId,
              "answer": "Prince Charles",
              "colour": res.retval.colour,
            }
          ]
      });
    });

  });


});
function sleepSync(arg0: number) {
  throw new Error('Function not implemented.');
}

