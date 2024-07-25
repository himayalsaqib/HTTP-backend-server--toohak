// includes http tests for the route GET /v1/player/{playerid}/question/{questionposition}/results

import { requestDelete, requestGet, requestPost, requestPut } from "../helper-files/requestHelper";
import { QuestionBody, QuizSessionAction } from "../quiz";
import sleepSync from 'slync';

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
  let questionId1: number;
  let questionId2: number;
  let correctAnswerId: number;
  let wrongAnswerId: number
  let startSessionBody: { autoStartNum: number };
  let sessionId: number;
  let playerBody: { sessionId: number, name: string };
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
    let questionRes = requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId1 = questionRes.retval.questionId;

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
    questionRes = requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId2 = questionRes.retval.questionId;

    // getting the answerId for correct answer and wrong answer
    const quizInfoRes = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
    correctAnswerId = quizInfoRes.retval.questions[0].answers[0].answerId;
    wrongAnswerId = quizInfoRes.retval.questions[1].answers[1].answerId;

    // starting a new session in LOBBY state
    startSessionBody = { autoStartNum: 3 };
    const sessionResponse = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionResponse.retval.sessionId;

    // making a player join the session
    playerBody = { sessionId: sessionId, name: 'JaneDoe' };
    const playerResponse = requestPost(playerBody, '/v1/player/join');
    playerId = playerResponse.retval.playerId;

    // updating session state from LOBBY -> QUESTION_COUNTDOWN -> QUESTION_OPEN 
    requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
    sleepSync(3 * 1000);

    // initialising questionposition for path
    questionPosition = 1;

    // submitting an answer for the player 
    requestPut({ answerIds: [correctAnswerId] }, `/v1/player/${playerId}/question/${questionPosition}`);

    // updating session state from QUESTION_OPEN --> ANSWER_SHOW
    requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
  });

  describe('Testing for correct return type (status code 200)', () => {
    test('Successfully returns results for a particular quiz question when player is correct', () => {
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionPosition}/results`);
      expect(res).toStrictEqual({
        retval: {
          questionId: questionId1,
          playersCorrectList: [playerBody.name],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 100
        },
        statusCode: 200
      });
    });

    test('Successfully returns results for a particular quiz question when player is wrong', () => {
      // updating session state from ANSWER_SHOW --> QUESTION_COUNTDOWN --> QUESTION_OPEN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      sleepSync(3 * 1000);

      // player submits wrong answer for question 2
      requestPut({ answerIds: [wrongAnswerId] }, `/v1/player/${playerId}/question/${questionPosition + 1}`);

      // updating session state from QUESTION_OPEN --> ANSWER_SHOW
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/question/${questionPosition}/results`);
      expect(res).toStrictEqual({
        retval: {
          questionId: questionId2,
          playersCorrectList: [],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 0
        },
        statusCode: 200
      });
    });
  });

  describe('Testing for error cases (status code 400)', () => {
    test('Player ID does not exist', () => {
      const res = requestGet({}, `/v1/player/${playerId + 1}/question/${questionPosition}/results`);
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('Question position is not valid for the session', () => {
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionPosition + 2}/results`);
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('Session is not in ANSWER_SHOW state', () => {
      // update session state from ANSWER_SHOW --> END
      requestPut({ action: QuizSessionAction.END }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/question/${questionPosition}/results`);
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('If session is not currently on this question', () => {
      // update session state from ANSWER_SHOW --> QUESTION_COUNTDOWN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION}, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/question/${questionPosition}/results`);
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });
  });
});