// includes http tests for the route GET /v1/player/{playerid}/question/{questionposition}/results

import { requestDelete, requestPost } from "../helper-files/requestHelper";
import { QuestionBody } from "../quiz";

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});
  
const ERROR = { error: expect.any(String) };

describe('GET /v1/player/{playerid}/question/{questionposition}/results', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let questionBody: QuestionBody;
  let startSessionBody: { autoStartNum: number };
  let sessionId: number;
  let playerBody: { sessionId: number, name: string };
  // let updateActionBody: { action: string };
  let playerId: number;
  let questionPosition: number;

  beforeEach(() => {
    // registering a user
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    // creating a quiz
    quizBody = { name: 'Quiz Name', description: 'Quiz description' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;

    // creating 2 quiz questions
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
    requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });
    questionBody = {
      question: 'The sun is a ...',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'star', correct: true },
        { answer: 'planet', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.png',
    };
    requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });

    // starting a new session in LOBBY state
    startSessionBody = { autoStartNum: 3 };
    const sessionResponse = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionResponse.retval.sessionId;

    // making a player join the session
    playerBody = { sessionId: sessionId, name: 'JaneDoe' };
    const playerResponse = requestPost(playerBody, '/v1/player/join');
    playerId = playerResponse.retval.playerId;

    // updating session state from LOBBY -> QUESTION_COUNTDOWN -> QUESTION_OPEN 

    // submitting an answer for the player 

    // updating session state from QUESTION_OPEN --> ANSWER_SHOW

    // initialising questionposition for path
    questionPosition = 1;
  });

  describe('Testing for correct return type (status code 200)', () => {
    test('Successfully returns results for a particular question of the session', () => {
      // call route
    });
  });

  describe('Testing for error cases (status code 400)', () => {
    test('Player ID does not exist', () => {
      // playerId + 1
    });

    test('Question position is not valid for the session', () => {
      // questionPosition + 2 (theres only 2 questions in the session so this is invalid)
    });

    test('Session is not in ANSWER_SHOW state', () => {
      // update session state from ANSWER_SHOW --> END
    });

    test('If session is not currently on this question', () => {
      // update session state from ANSWER_SHOW --> QUESTION_COUNTDOWN
    });
  });
});