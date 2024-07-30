// includes http tests for the route /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv
import sleepSync from 'slync';
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
  let sessionStartBody: { autoStartNum: number };
  let sessionId: number;
  let playerId: number;
  let correctAnsIds: number[];
  let incorrectAnsIds: number[];
  let questionPosition: number;

  beforeEach(() => {
    // Registering a user
    userBody = { email: 'valid@gmail.com', password: 'Password123', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerRes = requestPost(userBody, '/v1/admin/auth/register');
    token = registerRes.retval.token;

    // Create a quiz
    quizBody = { name: 'Quiz Name', description: 'Valid quiz description' };
    const quizRes = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizRes.retval.quizId;

    // Create a question
    questionBody = {
      question: 'Who is your favourite artist\'s favourite artist?',
      duration: 5,
      points: 10,
      answers: [
        { answer: 'Chappell Roan', correct: true },
        { answer: 'Sabrina Carpenter', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/file/path.png'
    };

    const questionRes = requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });
    questionIds = [];
    questionIds.push(questionRes.retval.questionId);

    // Get the answer IDs for the question answers
    const quizInfo = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
    correctAnsIds = [];
    incorrectAnsIds = [];
    correctAnsIds.push(quizInfo.retval.questions[0].answers[0].answerId);
    incorrectAnsIds.push(quizInfo.retval.questions[0].answers[1].answerId);

    // Start a session i.e. state = LOBBY
    sessionStartBody = { autoStartNum: 4 };
    const sessionStartRes = requestPost(sessionStartBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionStartRes.retval.sessionId;
    questionPosition = 1;

    // Have a player join the session
    const playerJoinRes = requestPost({ sessionId: sessionId, name: 'Jane' }, '/v1/player/join');
    playerId = playerJoinRes.retval.playerId;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Correctly returns a link with data for 1 question, 1 player', () => {
      // Update state to QUESTION_OPEN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // Player submits answer
      requestPut({ answerIds: [correctAnsIds[0]] }, `/v1/player/${playerId}/question/${questionPosition}/answer`);

      // Sets state to FINAL_RESULTS
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, { token });
      // Expect URL to be a valid CSV URL usging regex
      expect(res.retval.url).toMatch(/^http:\/\/localhost:3200\/csv\/.+\.csv$/);
      expect(res.statusCode).toBe(200);
      expect(res.retval).toHaveProperty('url');
    });

    test('Correctly returns a link with data for muliple question and multiple players', () => {
      // Create a second question
      questionBody = {
        question: 'Who is the Monarch of England',
        duration: 5,
        points: 10,
        answers: [
          { answer: 'Prince Charles', correct: true },
          { answer: 'Prince William', correct: false }
        ],
        thumbnailUrl: 'http://google.com/some/file/path.png'
      };
      // Get questionId
      requestPost({ questionBody }, `/v2/admin/quiz/${quizId}/question`, { token });

      // Get answerIds for the correct and incorrect ans
      const quizInfoRes = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
      correctAnsIds.push(quizInfoRes.retval.questions[1].answers[0].answerId);
      incorrectAnsIds.push(quizInfoRes.retval.questions[1].answers[1].answerId);

      // Start new session in LOBBY state
      sessionStartBody = { autoStartNum: 4 };
      const sessionRes = requestPost(sessionStartBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
      const newSessionId = sessionRes.retval.sessionId;
      questionPosition = 1;

      // Multiple players join
      playerId = requestPost({ sessionId: newSessionId, name: 'Aelin' }, '/v1/player/join').retval.playerId;
      const playerId2 = requestPost({ sessionId: newSessionId, name: 'Rowan' }, '/v1/player/join').retval.playerId;
      const playerId3 = requestPost({ sessionId: newSessionId, name: 'Lysandra' }, '/v1/player/join').retval.playerId;

      // Update state to QUESTION_OPEN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });

      // Submit answers for first question
      requestPut({ answerIds: [incorrectAnsIds[0]] }, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      requestPut({ answerIds: [correctAnsIds[0]] }, `/v1/player/${playerId2}/question/${questionPosition}/answer`);
      sleepSync(1000);
      requestPut({ answerIds: [correctAnsIds[0]] }, `/v1/player/${playerId3}/question/${questionPosition}/answer`);

      // Move to the next question
      questionPosition = 2;

      // Update state to QUESTION_OPEN
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });

      // Submit next answers
      requestPut({ answerIds: [incorrectAnsIds[1]] }, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      requestPut({ answerIds: [correctAnsIds[1]] }, `/v1/player/${playerId3}/question/${questionPosition}/answer`);

      // Set state to FINAL_RESULTS
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });
      requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${newSessionId}`, { token });
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${newSessionId}/results/csv`, { token });
      // Expect URL to be a valid CSV URL usging regex
      expect(res.retval.url).toMatch(/^http:\/\/localhost:3200\/csv\/.+\.csv$/);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Testing for session errors (status code 400)', () => {
    test('Returns error when session id does not refer to a valid session within this quiz', () => {
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId + 1}/results/csv`, { token });
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error when session is not in FINAL_RESULTS state', () => {
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, { token });
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('Testing for token errors (status code 401)', () => {
    test('Returns error when token is empty', () => {
      requestDelete({}, '/v1/clear');
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, { token });
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Returns error when token is invalid', () => {
      const invalidToken = token + '1';
      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, { token: invalidToken });
      expect(res.retval).toStrictEqual(ERROR);
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
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Returns error when quiz does not exist', () => {
      const invalidQuizId = quizId + 1;
      const res = requestGet({}, `/v1/admin/quiz/${invalidQuizId}/session/${sessionId}/results/csv`, { token });
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });
});
