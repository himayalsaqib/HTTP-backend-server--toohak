// includes http tests for the route /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv
import { requestDelete, requestPost, requestPut, requestGet } from '../helper-files/requestHelper';
import { QuestionBody, QuizSessionAction } from '../quiz';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let questionBody: QuestionBody;
  let questionIds: number[];
  let correctAnswerIds: number[];
  let startSessionBody: { autoStartNum: number };
  let sessionId: number;
  let playerBody: { sessionId: number, name: string };
  let playerId: number;
  let playerBody2: { sessionId: number, name: string };
  let playerId2: number;
  let playerBody3: { sessionId: number, name: string };
  let playerId3: number;

  beforeEach(() => {
    // Registering a user
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Admin', nameLast: 'User' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    // Creating a quiz
    quizBody = { name: 'Science Quiz', description: 'A quiz about science facts' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;

    // Creating 2 quiz questions
    questionBody = {
      question: 'What is the chemical symbol for water?',
      duration: 5,
      points: 10,
      answers: [
        { answer: 'H2O', correct: true },
        { answer: 'CO2', correct: false },
      ],
      thumbnailUrl: 'http://example.com/image1.png'
    };
    let questionRes = requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });
    questionIds = [];
    questionIds.push(questionRes.retval.questionId);

    questionBody = {
      question: 'How many planets are in the solar system?',
      duration: 5,
      points: 10,
      answers: [
        { answer: '8', correct: true },
        { answer: '9', correct: false }
      ],
      thumbnailUrl: 'http://example.com/image2.png',
    };
    questionRes = requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });
    questionIds.push(questionRes.retval.questionId);

    // Getting the answerIds for correct answers
    const quizInfoRes = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
    correctAnswerIds = [];
    correctAnswerIds.push(quizInfoRes.retval.questions[0].answers[0].answerId);
    correctAnswerIds.push(quizInfoRes.retval.questions[1].answers[0].answerId);

    // Starting a new session in LOBBY state
    startSessionBody = { autoStartNum: 3 };
    const sessionResponse = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionResponse.retval.sessionId;

    // Making 3 players join the session
    playerBody = { sessionId: sessionId, name: 'Giuliana' };
    let playerResponse = requestPost(playerBody, '/v1/player/join');
    playerId = playerResponse.retval.playerId;

    playerBody2 = { sessionId: sessionId, name: 'Hayden' };
    playerResponse = requestPost(playerBody2, '/v1/player/join');
    playerId2 = playerResponse.retval.playerId;

    playerBody3 = { sessionId: sessionId, name: 'Yuchao' };
    playerResponse = requestPost(playerBody3, '/v1/player/join');
    playerId3 = playerResponse.retval.playerId;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Correctly returns a link', () => {
      // Update session state from LOBBY -> QUESTION_COUNTDOWN -> QUESTION_OPEN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // Submitting answers for players
      requestPut({ answerIds: [correctAnswerIds[0]] }, `/v1/player/${playerId}/question/1/answer`);
      requestPut({ answerIds: [correctAnswerIds[0]] }, `/v1/player/${playerId2}/question/1/answer`);
      requestPut({ answerIds: [correctAnswerIds[0]] }, `/v1/player/${playerId3}/question/1/answer`);

      // Update session state from QUESTION_OPEN -> ANSWER_SHOW
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // Update session state from ANSWER_SHOW -> QUESTION_COUNTDOWN -> QUESTION_OPEN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // Submitting answers for second question
      requestPut({ answerIds: [correctAnswerIds[1]] }, `/v1/player/${playerId}/question/2/answer`);
      requestPut({ answerIds: [correctAnswerIds[1]] }, `/v1/player/${playerId2}/question/2/answer`);
      requestPut({ answerIds: [correctAnswerIds[1]] }, `/v1/player/${playerId3}/question/2/answer`);

      // Update session state from QUESTION_OPEN -> ANSWER_SHOW
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // End the session to move to FINAL_RESULTS
      requestPut({ action: QuizSessionAction.END }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // Fetching CSV results
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, { token });

      const expectedCSVUrl = expect.stringMatching(/^http(s)?:\/\/\S+\.csv$/); // Expect URL to be a valid CSV URL

      expect(res).toStrictEqual({
        retval: { url: expectedCSVUrl },
        statusCode: 200
      });
    });
  });

  describe('Testing for session errors (status code 400)', () => {
    test('Returns error when session id does not refer to a valid session within this quiz', () => {
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId + 1}/results/csv`, { token });
      expect(res.retval).toStrictEqual({ ERROR });
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error when session is not in FINAL_RESULTS state', () => {
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, { token });
      expect(res.retval).toStrictEqual({ ERROR });
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('Testing for token errors (status code 401)', () => {
    test('Returns error when token is empty', () => {
      requestDelete({}, '/v1/clear');
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, { token });
      expect(res.retval).toStrictEqual({ ERROR });
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Returns error when token is invalid', () => {
      const invalidToken = token + '1';
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, { token: invalidToken });
      expect(res.retval).toStrictEqual({ ERROR });
      expect(res.statusCode).toStrictEqual(401);
    });
  });

  describe('Testing for quiz errors (status code 403)', () => {
    test('Returns error when user is not an owner of this quiz', () => {
      // Register another user
      const newUserBody = { email: 'another@gmail.com', password: 'Password123', nameFirst: 'Different', nameLast: 'User' };
      const newUserRes = requestPost(newUserBody, '/v1/admin/auth/register');
      const newToken = newUserRes.retval.token;

      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, { token: newToken });
      expect(res.retval).toStrictEqual({ ERROR });
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Returns error when quiz does not exist', () => {
      const invalidQuizId = quizId + 1;
      const res = requestGet({}, `/v1/admin/quiz/${invalidQuizId}/session/${sessionId}/results/csv`, { token });
      expect(res.retval).toStrictEqual({ ERROR });
      expect(res.statusCode).toStrictEqual(403);
    });
  });
});
