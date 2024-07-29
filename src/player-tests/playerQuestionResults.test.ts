// includes http tests for the route GET /v1/player/{playerid}/question/{questionposition}/results

import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';
import { QuestionBody, QuizSessionAction } from '../quiz';
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
  let questionIds: number[];
  let correctAnswerIds: number[];
  let wrongAnswerId: number;
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
    questionIds = [];
    questionIds.push(questionRes.retval.questionId);

    questionBody = {
      question: 'The sun is a ...',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'star', correct: true },
        { answer: 'planet', correct: false },
        { answer: 'moon', correct: true }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.png',
    };
    questionRes = requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });
    questionIds.push(questionRes.retval.questionId);

    // getting the answerId for correct answer and wrong answer
    const quizInfoRes = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
    correctAnswerIds = [];
    correctAnswerIds.push(quizInfoRes.retval.questions[0].answers[0].answerId);
    correctAnswerIds.push(quizInfoRes.retval.questions[1].answers[0].answerId);
    wrongAnswerId = quizInfoRes.retval.questions[1].answers[1].answerId;

    // starting a new session in LOBBY state
    startSessionBody = { autoStartNum: 3 };
    const sessionResponse = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionResponse.retval.sessionId;

    // making a player join the session
    playerBody = { sessionId: sessionId, name: 'Jane' };
    const playerResponse = requestPost(playerBody, '/v1/player/join');
    playerId = playerResponse.retval.playerId;

    // updating session state from LOBBY -> QUESTION_COUNTDOWN -> QUESTION_OPEN
    requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
    requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

    // initialising questionposition for path
    questionPosition = 1;

    // submitting an answer for the player
    requestPut({ answerIds: [correctAnswerIds[0]] }, `/v1/player/${playerId}/question/${questionPosition}/answer`);
    // updating session state from QUESTION_OPEN --> ANSWER_SHOW
    requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
  });

  describe('Testing for correct return type (status code 200)', () => {
    test('Successfully returns results for a particular quiz question when player is correct', () => {
      const res = requestGet({}, `/v1/player/${playerId}/question/${questionPosition}/results`);
      expect(res).toStrictEqual({
        retval: {
          questionId: questionIds[0],
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
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // player submits wrong answer for question 2
      const playerAnswer = { answerIds: [wrongAnswerId] };
      requestPut(playerAnswer, `/v1/player/${playerId}/question/${questionPosition + 1}/answer`);

      // updating session state from QUESTION_OPEN --> ANSWER_SHOW
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/question/${questionPosition + 1}/results`);
      expect(res).toStrictEqual({
        retval: {
          questionId: questionIds[1],
          playersCorrectList: [],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 0
        },
        statusCode: 200
      });
    });

    test('Successfully returns results for a particular quiz question when player partially correct', () => {
      // updating session state from ANSWER_SHOW --> QUESTION_COUNTDOWN --> QUESTION_OPEN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // player submits only one correct answer for question 2
      const playerAnswer = { answerIds: [correctAnswerIds[1]] };
      requestPut(playerAnswer, `/v1/player/${playerId}/question/${questionPosition + 1}/answer`);

      // updating session state from QUESTION_OPEN --> ANSWER_SHOW
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/question/${questionPosition + 1}/results`);
      expect(res).toStrictEqual({
        retval: {
          questionId: questionIds[1],
          playersCorrectList: [],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 0
        },
        statusCode: 200
      });
    });

    test('Side effect: successfully returns averageAnswerTime', () => {
      // updating session state from ANSWER_SHOW --> QUESTION_COUNTDOWN --> QUESTION_OPEN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // player submits only one correct answer for question 2 but after 1 second
      sleepSync(1000);
      const playerAnswer = { answerIds: [correctAnswerIds[1]] };
      requestPut(playerAnswer, `/v1/player/${playerId}/question/${questionPosition + 1}/answer`);

      // updating session state from QUESTION_OPEN --> ANSWER_SHOW
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/question/${questionPosition + 1}/results`);
      expect(res).toStrictEqual({
        retval: {
          questionId: questionIds[1],
          playersCorrectList: [],
          averageAnswerTime: 1,
          percentCorrect: 0
        },
        statusCode: 200
      });
    });

    test('Side effect: successfully returns playersCorrectList in alphabetical order', () => {
      // starting a new session in LOBBY state
      startSessionBody = { autoStartNum: 2 };
      const sessionResponse = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      sessionId = sessionResponse.retval.sessionId;

      // making 2 players join the session
      playerBody.sessionId = sessionId;
      let playerResponse = requestPost(playerBody, '/v1/player/join');
      playerId = playerResponse.retval.playerId;

      const playerBody2 = { sessionId: sessionId, name: 'Doe' };
      playerResponse = requestPost(playerBody2, '/v1/player/join');
      const playerId2 = playerResponse.retval.playerId;

      // session state goes LOBBY -> QUESTION_COUNTDOWN -> QUESTION_OPEN
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // players submit answers
      requestPut({ answerIds: [correctAnswerIds[0]] }, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      requestPut({ answerIds: [correctAnswerIds[0]] }, `/v1/player/${playerId2}/question/${questionPosition}/answer`);

      // updating session state from QUESTION_OPEN --> ANSWER_SHOW
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/question/${questionPosition}/results`);
      expect(res).toStrictEqual({
        retval: {
          questionId: questionIds[0],
          playersCorrectList: [playerBody2.name, playerBody.name],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 100
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
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/question/${questionPosition}/results`);
      console.log(res);
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });
  });
});
