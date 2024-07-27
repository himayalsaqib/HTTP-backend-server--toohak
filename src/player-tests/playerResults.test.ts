// contains HTTP tests for route GET /v1/player/{playerid}/results

import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';
import { QuestionBody, QuizSessionAction } from '../quiz';
import sleepSync from 'slync';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/player/:playerid/results', () => {
let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
let token: string;
let quizBody: { name: string, description: string };
let quizId: number;
let createBody: { questionBody: QuestionBody };;
let questionIds: number[];
let correctAnswerIds: number[];
let wrongAnswerId: number;
let startSessionBody: { autoStartNum: number };
let sessionId: number;
let playerBody: { sessionId: number, name: string };
let playerId: number;
let playerId2: number;
let questionId: number;
let questionId2: number;

beforeEach(() => {
    // registering a user
    userBody = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    // creating a quiz
    quizBody = { name: 'Quiz Name', description: 'Quiz description' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;

    // creating quiz question 1
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
    const questionResponse = requestPost(createBody, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId = questionResponse.retval.questionId;

    // creating quiz question 2
    createBody = {
			questionBody: {
        question: 'The sun is a ...',
        duration: 5,
        points: 5,
        answers: [
          { answer: 'star', correct: true },
          { answer: 'planet', correct: false },
          { answer: 'moon', correct: true }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.png',
			}
		};

    const questionResponse2 = requestPost(createBody, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId2 = questionResponse2.retval.questionId;

		// getting the answerId for correct answer and wrong answer
    const quizInfoRes = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
    correctAnswerIds = [];
    correctAnswerIds.push(quizInfoRes.retval.questions[0].answers[0].answerId);
    correctAnswerIds.push(quizInfoRes.retval.questions[1].answers[0].answerId);
		correctAnswerIds.push(quizInfoRes.retval.questions[1].answers[2].answerId);
    wrongAnswerId = quizInfoRes.retval.questions[1].answers[0].answerId;

		// starting a new session in LOBBY state
    startSessionBody = { autoStartNum: 3 };
    const sessionResponse = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
    sessionId = sessionResponse.retval.sessionId;

    // player joins the session
    playerBody = { sessionId: sessionId, name: 'JaneDoe' };
    const playerResponse = requestPost(playerBody, '/v1/player/join');
    playerId = playerResponse.retval.playerId;

		playerBody = { sessionId: sessionId, name: 'Joe' };
    const playerResponse2 = requestPost(playerBody, '/v1/player/join');
    playerId2 = playerResponse2.retval.playerId;

		// updating session state from LOBBY -> QUESTION_COUNTDOWN -> QUESTION_OPEN
		requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
		requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

		// submitting answer to question 1 after 1 second
		sleepSync(1000);
		const questionPosition = 1;
		requestPut({ answerIds: [correctAnswerIds[0]] }, `/v1/player/${playerId}/question/${questionPosition}/answer`);

		// player 2 submits answer to question 1 after 2 seconds
		sleepSync(1000);
		requestPut({ answerIds: [correctAnswerIds[0]] }, `/v1/player/${playerId2}/question/${questionPosition}/answer`);

		// moving from QUESTION_OPEN to QUESTION_CLOSED after question duration
		sleepSync(createBody.questionBody.duration * 1000);

		// Updating session state from QUESTION_CLOSED -> ANSWER_SHOW -> QUESTION_COUNTDOWN -> QUESTION_OPEN
		requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
		requestPut({ action: QuizSessionAction.NEXT_QUESTION }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
		requestPut({ action: QuizSessionAction.SKIP_COUNTDOWN }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
});

	describe('Testing for correct return type (status code 200)', () => {
		const questionPosition = 1;
		test('Successfully returns results for a session', () => {
			// player 1 submits answer to question 2 after 3 seconds
			sleepSync(3000);
			requestPut({ answerIds: [correctAnswerIds[1]] }, `/v1/player/${playerId}/question/${questionPosition + 1}/answer`);

			// player 2 submits answer to question 2 after 4 seconds
			sleepSync(1000);
			requestPut({ answerIds: [correctAnswerIds[1]] }, `/v1/player/${playerId2}/question/${questionPosition + 1}/answer`);

			sleepSync(createBody.questionBody.duration * 1000);
			requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
			requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
			const res = requestGet({}, `/v1/player/${playerId}/results`);
			expect(res).toStrictEqual({
				retval: {
					usersRankedByScore: [
						{
							name: 'JaneDoe',
							score: 10
						},
						{
							name: 'Joe',
							score: 5
						}
					],
					questionResults: [
						{
							questionId: questionId,
							playersCorrectList: [
								'JaneDoe',
								'Joe'
							],
							averageAnswerTime: 2,
							percentCorrect: 100
						},
						{
							questionId: questionId2,
							playersCorrectList: [
								'JaneDoe',
								'Joe'
							],
							averageAnswerTime: 4,
							percentCorrect: 100
						},
					]
				},
				statusCode: 200
			});
		});

	test('Successfully returns results where both players tie for a question', () => {
		requestPut({ answerIds: wrongAnswerId }, `/v1/player/${playerId}/question/${questionPosition + 1}/answer`);
		requestPut({ answerIds: wrongAnswerId }, `/v1/player/${playerId2}/question/${questionPosition + 1}/answer`);
		sleepSync(createBody.questionBody.duration * 1000);
			requestPut({ action: QuizSessionAction.GO_TO_ANSWER }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
			requestPut({ action: QuizSessionAction.GO_TO_FINAL_RESULTS }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
			const res = requestGet({}, `/v1/player/${playerId}/results`);
			expect(res).toStrictEqual({
				retval: {
					usersRankedByScore: [
						{
							name: 'JaneDoe',
							score: 5
						},
						{
							name: 'Joe',
							score: 3
						}
					],
					questionResults: [
						{
							questionId: questionId,
							playersCorrectList: [
								'JaneDoe',
								'Joe'
							],
							averageAnswerTime: 2,
							percentCorrect: 100
						},
						{
							questionId: questionId2,
							playersCorrectList: [
								'JaneDoe',
								'Joe'
							],
							averageAnswerTime: 0,
							percentCorrect: 0
						},
					]
				},
				statusCode: 200
			});
		});

		test('Successfully returns results where both players tie for the final results', () => {
			
		});
	});

	describe('Testing for error cases (status code 400)', () => {
		test('PlayerId does not exist', () => {
      const res = requestGet({}, `/v1/player/${playerId}/results`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

		test('Session is not in FINAL_RESULTS stage', () => {
      requestPut({ action: QuizSessionAction.END }, `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });

      const res = requestGet({}, `/v1/player/${playerId}/results`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
	});
});