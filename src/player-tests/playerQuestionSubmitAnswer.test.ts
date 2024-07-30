// includes http tests for the route /v1/player/{playerid}/question/{questionposition}/answer
import sleepSync from 'slync';
import { requestDelete, requestPost, requestPut, requestGet } from '../helper-files/requestHelper';
import { QuestionBody, QuizSessionAction } from '../quiz';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('PUT /v1/player/{playerid}/question/{questionposition}/answer', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let createQuestionBody: { questionBody: QuestionBody };
  let sessionId: number;
  let playerId: number;
  let questionAction: { action: string };
  let answerIds: number[] = [];
  let questionId1: number;
  let questionId2: number;

  beforeEach(() => {
    // Registering a user
    userBody = { email: 'valid1@example.com', password: 'Password123', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    // Creating a quiz
    quizBody = { name: 'Sample Quiz', description: 'Quiz Description' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;

    // Creating 1 quiz question
    const answerBody1 = { answer: 'Prince Charles', correct: true };
    const answerBody2 = { answer: 'Prince William', correct: false };
    const answerBody3 = { answer: 'Prince Harry', correct: false };
    createQuestionBody = {
      questionBody: {
        question: 'Who is the Monarch of England?',
        duration: 5,
        points: 5,
        answers: [answerBody1, answerBody2, answerBody3],
        thumbnailUrl: 'http://example.com/image.png'
      }
    };
    const questionResponse1 = requestPost(createQuestionBody, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId1 = questionResponse1.retval.questionId;

    // Creating another  quiz question
    const answerBody4 = { answer: 'Tokyo', correct: false };
    const answerBody5 = { answer: 'Osaka', correct: true };
    const answerBody6 = { answer: 'Kyoto', correct: false };
    createQuestionBody = {
      questionBody: {
        question: 'Which is the second largest city in Japan?',
        duration: 5,
        points: 5,
        answers: [answerBody4, answerBody5, answerBody6],
        thumbnailUrl: 'http://example.com/image2.png'
      }
    };
    const questionResponse2 = requestPost(createQuestionBody, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId2 = questionResponse2.retval.questionId;

    const quizInfoResponse = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
    // answer object has type { answerId: number } in an array
    answerIds = (quizInfoResponse.retval.questions[0].answers as { answerId: number }[]).map(answer => answer.answerId);

    // Starting a quiz session
    const startSessionResponse = requestPost({}, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = startSessionResponse.retval.sessionId;
    questionAction = { action: QuizSessionAction.NEXT_QUESTION };

    // Player joins the session
    const playerBody = { sessionId: sessionId, name: 'Player One' };
    const playerJoinResponse = requestPost(playerBody, '/v1/player/join');
    playerId = playerJoinResponse.retval.playerId;

    requestPut(questionAction, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

    // Skip countdown so that question is in QUESION_OPEN state
    questionAction = { action: QuizSessionAction.SKIP_COUNTDOWN };
    requestPut(questionAction, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Correct return type after submitting 1 answer', () => {
      const submitAns = { answerIds: [answerIds[0]] };
      const questionPosition = 1;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual({});
      expect(res.statusCode).toStrictEqual(200);
    });

    test('Side effect: player results correctly displays correct answered question', () => {
      const submitAns = { answerIds: [answerIds[0]] };
      const questionPosition = 1;
      requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual({});
      expect(res.statusCode).toStrictEqual(200);

      // Updating state to GO_TO_ANSWER
      // Calling playerQuestionQResults to verify correct results displayed
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      const verifyRes = requestGet({}, `/v1/player/${playerId}/question/${questionPosition}/results`);
      expect(verifyRes.retval).toStrictEqual(
        {
          questionId: questionId1,
          playersCorrectList: [
            'Player One'
          ],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 100
        });
    });

    test('Side effect: session final results correctly calculates player\'s points', () => {
      sleepSync(2000);
      const submitAns = { answerIds: [answerIds[0]] };
      let questionPosition = 1;
      requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
      requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);

      // Move to next question
      questionPosition = 2;

      // Update state to QUESTION_OPEN
      requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      // Submit incorrect answer
      requestPut({ answerIds: [answerIds[0]] }, `/v1/player/${playerId}/question/${questionPosition}/answer`);

      // Set state to FINAL_RESULTS
      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, { token });
      expect(res).toStrictEqual({
        retval: {
          usersRankedByScore: [

            {
              name: 'Player One',
              score: 5,
            }
          ],
          questionResults: [
            {
              questionId: questionId1,
              playersCorrectList: [
                'Player One'
              ],
              averageAnswerTime: 2,
              percentCorrect: 100,
            },
            {
              questionId: questionId2,
              playersCorrectList: [],
              averageAnswerTime: 0,
              percentCorrect: 0,
            }
          ]
        },
        statusCode: 200,
      });
    });

    test('Side effect: playerResults correctly shows playersCorrectList after resubmitting correct answer', () => {
      const submitAns = { answerIds: [answerIds[1]] };
      const questionPosition = 1;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual({});
      expect(res.statusCode).toStrictEqual(200);

      // Resubmitting the correct answer
      const reSubmitAns = { answerIds: [answerIds[0]] };
      const newRes = requestPut(reSubmitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(newRes.retval).toStrictEqual({});
      expect(newRes.statusCode).toStrictEqual(200);

      requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
      // requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const resubmitRes = requestGet({}, `/v1/player/${playerId}/question/${questionPosition}/results`);
      expect(resubmitRes.retval.playersCorrectList).toStrictEqual(['Player One']);
    });

    test('Correct return type after submiting multiple answers', () => {
      const submitAns = { answerIds: [answerIds[1], answerIds[0]] };
      const questionPosition = 1;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual({});
      expect(res.statusCode).toStrictEqual(200);
    });
  });

  describe('Testing error cases (status code 400', () => {
    test('Returns error for invalid player id', () => {
      const submitAns = { answerIds: [answerIds[0]] };
      const questionPosition = 1;
      const invalidPlayerId = playerId + 1;
      const res = requestPut(submitAns, `/v1/player/${invalidPlayerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error for invalid question position', () => {
      const submitAns = { answerIds: [answerIds[0]] };
      const invalidQuestionPosition = 100;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${invalidQuestionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error when session is not in QUESTION_OPEN state', () => {
      const submitAns = { answerIds: [answerIds[0]] };
      const questionPosition = 1;

      // Session state changed
      questionAction = { action: QuizSessionAction.GO_TO_ANSWER };
      requestPut(questionAction, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error for invalid answer id', () => {
      const submitAns = { answerIds: [answerIds[5]] };
      const questionPosition = 1;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error for duplicate answer id', () => {
      const submitAns = { answerIds: [answerIds[0], answerIds[0]] };
      const questionPosition = 1;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error when less than 1 answer id submitted', () => {
      const submitAns: { answerIds: number[] } = { answerIds: [] };
      const questionPosition = 1;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Returns error when session is not currently on this question', () => {
      const submitAns = { answerIds: [answerIds[0]] };
      const questionPosition = 2;
      const res = requestPut(submitAns, `/v1/player/${playerId}/question/${questionPosition}/answer`);
      expect(res.retval).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });
});
