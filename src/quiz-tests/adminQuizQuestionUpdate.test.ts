// includes http tests for the route PUT /v1/admin/quiz/{quizid}/question/{questionid}

import { requestDelete, requestGet, requestPost, requestPut } from "../helper-files/requestHelper";
import { QuizQuestionAnswers } from "../quiz";

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('PUT /v1/admin/quiz/{quizid}/question/{questionid}', () => {
	const error = { error: expect.any(String) };

  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
	let quizBody: { token: string, name: string, description: string };
  let quizId: number;
	let questionBody: { question: string, duration: number, points: number, answers: QuizQuestionAnswers[] };
	let question: { questionId: number };
	
	let updateBody: {
		token: string,
		questionBody: {
			question: string,
			duration: number,
			points: number,
			answers: QuizQuestionAnswers[]
		}
	};
	
  beforeEach(() => {
		// regsitering a user
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

		// creating a quiz
    quizBody = { token: token, name: 'Quiz Name', description: 'Quiz description' };
    const quizResponse = requestPost(quizBody, '/v1/admin/quiz');
    quizId = quizResponse.retval.quizId;

		// creating a quiz question
		const answers = [
			{ answer: 'Prince Charles', correct: true },
			{ answer: 'Prince William', correct: false }
		];
		questionBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answers };
		const createResponse = requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`);
		question = createResponse.retval;

		updateBody = {
			token: token,
			questionBody: {
				question: 'The sun is a ...',
				duration: 5,
				points: 5,
				answers: [
					{
						answer: 'star',
						correct: true
					},
					{
						answer: 'planet',
						correct: false
					}
				]
			}
		};
  });

  describe('Testing successful quiz question update (status code 200)', () => {
		// how to test colour is one of given colours

		test('Has the correct return type', () => {
			const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
			expect(res).toStrictEqual({
				retval: {},
				statusCode: 200
			});
		});

		test('Side effect: adminQuizInfo returns updated info about quiz question', () => {
			let res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
			expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

			res = requestGet({ token }, `/v1/admin/quiz/${quizId}`);
			expect(res.retval).toStrictEqual({
				quizId: quizId,
				name: quizBody.name,
				timeCreated: expect.any(Number),
				timeLastEdited: expect.any(Number),
				description: quizBody.description,
				numQuestion: 1,
				questions: [
					{
						questionId: question.questionId,
						question: updateBody.questionBody.question,
						duration: 5,
						points: 5,
						answers: [
							{
								answerId: expect.any(Number),
								answer: 'star',
								colour: expect.any(String),
								correct: true
							},
							{
								answerId: expect.any(Number),
								answer: 'planet',
								colour: expect.any(String),
								correct: false
							}
						]
					}
				]
			});
			expect(res.statusCode).toStrictEqual(200);
		});

		test('Side effect: adminQuizInfo displays updated timeLastEdited', () => {
			const requestTime = Math.floor(Date.now() / 1000);
			let res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
			expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

			res = requestGet({ token }, `/v1/admin/quiz/${quizId}`);
			expect(res.retval.timeLastEdited).toBeGreaterThanOrEqual(requestTime);
			expect(res.retval.timeLastEdited).toBeLessThanOrEqual(requestTime + 1);
		});
  });

	describe('Testing questionId and parameters given to adminQuizQuestionUpdate (status code 400)', () => {
		describe('Testing questionId errors', () => {
			test('Question Id is not a valid question in the quiz', () => {
				question.questionId++;
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});
		});

		describe('Testing question parameter\'s errors', () => {
			test('Question string is less than 5 characters', () => {
				updateBody.questionBody.question = 'What';
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});

			test('Question string is more than 50 characters', () => {
				updateBody.questionBody.question = 'This is a reallyreally long question: What is earth?';
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});

			test('Question duration is not a positive number', () => {
				updateBody.questionBody.duration = 0;
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});

			test('Sum of question durations in the quiz exceeds 3 minutes if question is updated', () => {
				updateBody.questionBody.duration = 181;
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});

			test('Question points is less than 1', () => {
				updateBody.questionBody.points = 0;
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});

			test('Question points are more than 10', () => {
				updateBody.questionBody.points = 11;
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});
		});

		describe('Testing answer parameter\'s errors', () => {
			test('Question has less than 2 answers', () => {
				const oneAnswer = [{ answer: 'Star', correct: true }];
				updateBody.questionBody.answers = oneAnswer;
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});

			test('Question has more than 6 answers', () => {
				const sevenAnswers = [
					{ answer: 'star', correct: true },
					{ answer: 'planet', correct: false },
					{ answer: 'moon', correct: false },
					{ answer: 'blackhole', correct: false },
					{ answer: 'asteroid', correct: false },
					{ answer: 'spaceship', correct: false },
					{ answer: 'satellite', correct: false },
				];
				updateBody.questionBody.answers = sevenAnswers;
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});

			test('Answer string is less than 1 character', () => {
				const badAnswer = { answer: '', correct: false };
				updateBody.questionBody.answers.push(badAnswer);
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});

			test('Answer string is more than 30 character', () => {
				const badAnswer = { answer: 'a reallyreallyreally long answer', correct: false };
				updateBody.questionBody.answers.push(badAnswer);
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});

			test('Any answer strings of the question are duplicates of one another', () => {
				const badAnswer = { answer: 'planet', correct: false };
				updateBody.questionBody.answers.push(badAnswer);
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});

			test('There are no correct answers', () => {
				const badAnswers = [
					{ answer: 'star', correct: false },
					{ answer: 'planet', correct: false },
				];
				updateBody.questionBody.answers = badAnswers;
				const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
				expect(res).toStrictEqual({
					retval: error,
					statusCode: 400
				});
			});
		});
  });

	describe('Testing token errors (status code 401)', () => {
		test('Returns error when token is empty', () => {
			requestDelete({}, '/v1/clear');
      const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
			expect(res).toStrictEqual({
				retval: error,
				statusCode: 401
			});
		});

		test('Returns error when sessionId is not a valid user session', () => {
			const sessionId = parseInt(token) + 1;
      updateBody.token = sessionId.toString();
      const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
			expect(res).toStrictEqual({
				retval: error,
				statusCode: 401
			});
		});
  });

	describe('Testing quizId errors (status code 403)', () => {
		test('Returns error when user is not an owner of the quiz', () => {
			const user2 = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'John', nameLast: 'Doe' };
    	let res = requestPost(user2, '/v1/admin/auth/register');
    	updateBody.token = res.retval.token;

			res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
			expect(res).toStrictEqual({
				retval: error,
				statusCode: 403
			});
		});

		test('Returns error when quiz doesn\'t exist', () => {
			quizId++;
			const res = requestPut(updateBody, `/v1/admin/quiz/${quizId}/question/${question.questionId}`);
			expect(res).toStrictEqual({
				retval: error,
				statusCode: 403
			});
		});
  });
});