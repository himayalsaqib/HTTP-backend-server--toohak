// includes http tests for the route /v1/admin/quiz/{quizid}/session/{sessionid}/results

import { requestGet, requestDelete, requestPost, requestPut } from "../helper-files/requestHelper";
import { QuestionBody } from "../quiz";

const ERROR = expect.any(String);

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/admin/quiz/{quizid}/session/{sessionid}/results', () => {
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
    
    // start a session i.e. state = LOBBY
    sessionStartBody = { autoStartNum: 4 };
    const sessionStartRes = requestPost(sessionStartBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionStartRes.retval.sessionId;

    // have a player join the session
    requestPost({ sessionId: sessionId, name: 'Jane' }, '/v1/player/join');
  })
  
  describe('Testing successful cases (status code 200)', () => {
    test('Has the correct return type with one player', () => {
      // 
    });

    test('Side-effect: Correctly lists usersRankedByScore in descending order with multiple players', () => {
      // 
    });
  });

  describe('Testing errors in sessionId and quiz session state (status code 400)', () => {
    test.todo('The session Id does not refer to a valid session within this quiz');

    test.todo('The session is not in FINAL_RESULTS state');
  });

  describe('Testing token errors (status code 401)', () => {
    test.todo('The token is empty (no users are registered)');

    test.todo('The token is invalid (does not refer to a valid logged in user)');
  });

  describe('Testing quiz ownership and quiz existence errors (status code 403)', () => {
    test.todo('The user is not an owner of this quiz');

    test.todo('The quiz does not exist');
  });
});
