// contains HTTP tests for route GET /v1/player/{playerid}/chat

import { requestDelete, requestPost, requestGet } from '../helper-files/requestHelper';
import { QuestionBody } from '../quiz';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/player/:playerid/chat', () => {
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

    // player 1 sends a message
    const message = { message: { messageBody: 'Hello everyone! Nice to chat.' } };
    requestPost(message, `/v1/player/${playerId1}/chat`);
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has correct return type for 1 message, 1 player', () => {
      const res = requestGet({}, `/v1/player/${playerId1}/chat`);
      expect(res).toStrictEqual({
        retval:
        {
          messages: [
            {
              messageBody: 'Hello everyone! Nice to chat.',
              playerId: playerId1,
              playerName: expect.any(String),
              timeSent: expect.any(Number)
            }
          ]
        },
        statusCode: 200,
      });
    });

    test('Has correct return type for multiple messages, multiple players', () => {
      // 2 players join
      playerBody = { sessionId: sessionId, name: 'Charli XCX' };
      playerId2 = requestPost(playerBody, '/v1/player/join').retval.playerId;

      playerBody = { sessionId: sessionId, name: 'Lorde' };
      playerId3 = requestPost(playerBody, '/v1/player/join').retval.playerId;

      // players send one message each
      const message2 = { message: { messageBody: "Girl, it's so confusing sometimes to be a girl" } };
      requestPost(message2, `/v1/player/${playerId2}/chat`);

      const message3 = { message: { messageBody: "'Cause I ride for you, Charli" } };
      requestPost(message3, `/v1/player/${playerId3}/chat`);

      const res = requestGet({}, `/v1/player/${playerId1}/chat`);
      expect(res).toStrictEqual({
        retval:
        {
          messages: [
            {
              messageBody: 'Hello everyone! Nice to chat.',
              playerId: playerId1,
              playerName: expect.any(String),
              timeSent: expect.any(Number)
            },
            {
              messageBody: "Girl, it's so confusing sometimes to be a girl",
              playerId: playerId2,
              playerName: 'Charli XCX',
              timeSent: expect.any(Number)
            },
            {
              messageBody: "'Cause I ride for you, Charli",
              playerId: playerId3,
              playerName: 'Lorde',
              timeSent: expect.any(Number)
            }
          ]
        },
        statusCode: 200,
      });
    });
  });

  describe('Testing player ID errors (status code 400)', () => {
    test('The player ID does not exist', () => {
      const res = requestGet({}, `/v1/player/${playerId1 + 1}/chat`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });
});
