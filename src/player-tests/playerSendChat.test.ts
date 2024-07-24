// contains HTTP tests for route POST /v1/player/{playerid}/chat

import { requestDelete, requestPost, requestGet } from '../helper-files/requestHelper';
import { QuestionBody } from '../quiz';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/player/:playerid/chat', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let createBody: { questionBody: QuestionBody };
  let startSessionBody: { autoStartNum: number };
  let sessionId: number;
  let playerBody: { sessionId: number, name: string };
  let playerId1: number;
  let playerId2: number;
  let playerId3: number;

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

    // 1 player joins session
    playerBody = { sessionId: sessionId, name: '' };
    playerId1 = requestPost(playerBody, '/v1/player/join').retval.playerId;
  });

  describe('Testing successful cases (status code 200)', () => {
    beforeEach(() => {
      // 2 players join session
      playerBody = { sessionId: sessionId, name: '' };
      playerId2 = requestPost(playerBody, '/v1/player/join').retval.playerId;

      playerBody = { sessionId: sessionId, name: '' };
      playerId3 = requestPost(playerBody, '/v1/player/join').retval.playerId;
    });

    test('Has correct return type', () => {
      const message = { message: { messageBody: 'Hello everyone! Nice to chat.' } };
      const res = requestPost(message, `/v1/player/${playerId1}/chat`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect: playerViewChat displays all messages in current session', () => {
      const message1 = { message: { messageBody: 'Hello everyone! Nice to chat.' } };
      requestPost(message1, `/v1/player/${playerId1}/chat`);

      const message2 = { message: { messageBody: 'Hiiii' } };
      requestPost(message2, `/v1/player/${playerId2}/chat`);

      const message3 = { message: { messageBody: 'Hellooooo' } };
      requestPost(message3, `/v1/player/${playerId3}/chat`);

      const res = requestGet({}, `/v1/player/${playerId1}/chat`);
      expect(res.retval).toStrictEqual({
        messages: [
          {
            messageBody: 'Hello everyone! Nice to chat.',
            playerId: playerId1,
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          },
          {
            messageBody: 'Hiiii',
            playerId: playerId2,
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          },
          {
            messageBody: 'Hellooooo',
            playerId: playerId3,
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          }
        ]
      });
    });

    test('Side effect: timeSent should be within 1 second', () => {
      const time = Math.floor(Date.now() / 1000);
      const message1 = { message: { messageBody: 'Hello everyone! Nice to chat.' } };
      requestPost(message1, `/v1/player/${playerId1}/chat`);

      const res = requestGet({}, `/v1/player/${playerId1}/chat`);
      expect(res.retval.messages[0].timeSent).toBeGreaterThanOrEqual(time);
      expect(res.retval.messages[0].timeSent).toBeLessThanOrEqual(time + 1);
    });
  });

  describe('Testing playerId error (status code 400)', () => {
    test('PlayerId does not exist', () => {
      const message1 = { message: { messageBody: 'Hello everyone! Nice to chat.' } };
      const res = requestPost(message1, `/v1/player/${playerId1 + 1}/chat`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing messageBody errors (status code 400)', () => {
    test('Message body is less than 1 character', () => {
      const message1 = { message: { messageBody: '' } };
      const res = requestPost(message1, `/v1/player/${playerId1}/chat`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Message body is more than 100 characters', () => {
      const message1 = { message: { messageBody: '1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 ' } };
      const res = requestPost(message1, `/v1/player/${playerId1}/chat`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });
});
