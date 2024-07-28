// includes http tests for the route /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv
import { error } from 'console';
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
      duration: 4,
      points: 9,
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
    test('Correctly returns a link', () => {
       // Update state to QUESTION_OPEN
       requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
       requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
 
       // Player submits answer
       requestPut({ answerIds: [correctAnsIds[0]] }, `/v1/player/${playerId}/question/${questionPosition}/answer`);
 
       // Sets state to FINAL_RESULTS
       requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
       requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token }); 
        // Fetching CSV results
        const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, { token });
        // Expect URL to be a valid CSV URL usging regex
        const expectedCSVUrl = expect.stringMatching(/^http(s)?:\/\/\S+\.csv$/); 
        expect(res.retval.url).toStrictEqual(/^https?:\/\/.+\..+\/.+\.csv$/);
        expect(res).toStrictEqual({
          retval: { url: expectedCSVUrl },
          statusCode: 200
        });
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
