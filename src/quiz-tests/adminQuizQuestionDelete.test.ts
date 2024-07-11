// contains HTTP tests for adminQuizQuestionDelete function 

import { requestDelete, requestGet, requestPost} from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('DELETE /v1/admin/quiz/:quizid/question/:questionid', () => {
    const error = { error: expect.any(String) };
    let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
    let quizBody: { token: string, name: string, description: string };
    let token: string;
    let answerBody: { answer: string, correct: boolean }[];
    let questionBody: { question: string, duration: number, points: number, answers: { answer: string, correct: boolean }[]  };
		let quizId: number;
		let questionId: number;
		let questionId2: number;

beforeEach(() => {
	userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
	const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
	token = registerResponse.retval.token;

	quizBody = { token: token, name: 'Sample Quiz', description: 'Sample Description' };
	const quizResponse = requestPost(quizBody, '/v1/admin/quiz');
	quizId = quizResponse.retval.quizId;

	answerBody = [
		{ answer: 'Answer 1', correct: false },
		{ answer: 'Answer 2', correct: true },
		{ answer: 'Answer 3', correct: false },
		{ answer: 'Answer 4', correct: false }
	];

	questionBody = {
		question: 'Sample Question 1?',
		duration: 30,
		points: 10,
		answers: answerBody
	};

	const createBody = { token: token, questionBody: questionBody};
	const questionResponse = requestPost(createBody, `/v1/admin/quiz/${quizId}/question`);
  questionId = questionResponse.retval.questionId;

	createBody.questionBody.question = 'Sample Question 2?';
  const questionResponse2 = requestPost(createBody, `/v1/admin/quiz/${quizId}/question`);
  questionId2 = questionResponse2.retval.questionId;

});

	test('Successfully deletes a question', () => {
		const res = requestDelete({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}`);
		expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
	});

	test('Side effect: adminQuizInfo returns quiz without the deleted question', () => {
		requestDelete({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}`);

		const res = requestGet({ token }, `/v1/admin/quiz/${quizId}`);
		expect(res.retval).toStrictEqual({
			quizId: quizId,
			name: quizBody.name,
			timeCreated: expect.any(Number),
			timeLastEdited: expect.any(Number),
			description: quizBody.description,
			numQuestions: 1,
			questions: [
				{
					questionId: questionId2,
					question: 'Sample Question 2?',
					duration: 30,
					points: 10,
					answers: [
						{
							answerId: expect.any(Number),
							answer: 'Answer 1',
							colour: expect.any(String),
							correct: false
						},
						{
							answerId: expect.any(Number),
							answer: 'Answer 2',
							colour: expect.any(String),
							correct: true
						},
						{
							answerId: expect.any(Number),
							answer: 'Answer 3',
							colour: expect.any(String),
							correct: false
						},
						{
							answerId: expect.any(Number),
							answer: 'Answer 4',
							colour: expect.any(String),
							correct: false
						}
					]
				}
			],
			duration: 30
		});
		expect(res.statusCode).toStrictEqual(200);
	});

	test('Side effect: adminQuizInfo displays updated timeLastEdited', () => {
		const requestTime = Math.floor(Date.now() / 1000);
		requestDelete({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}`);

		const res = requestGet({ token }, `/v1/admin/quiz/${quizId}`);
		expect(res.retval.timeLastEdited).toBeGreaterThanOrEqual(requestTime);
		expect(res.retval.timeLastEdited).toBeLessThanOrEqual(requestTime + 1);
	});

	describe('Testing parameters given to adminQuizQuestionUpdate (status code 400)', () => {
		describe('Testing questionId errors', () => {
		  test('Question Id does not refer to a valid question within this quiz', () => {
			questionId++;
			const res = requestDelete({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}`);
			expect(res).toStrictEqual({ retval: error, statusCode: 400 });
		  });
		});
	
});
	describe('Testing token errors (status code 401)', () => {
		test('Returns error when token is empty', () => {
			requestDelete({}, '/v1/clear');
			const res = requestDelete({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}`);
			expect(res).toStrictEqual({ retval: error, statusCode: 401 });
		});

		test('Returns error when sessionId is not a valid user session', () => {
			const sessionId = parseInt(token) + 1;
			const res = requestDelete({ token: sessionId.toString() }, `/v1/admin/quiz/${quizId}/question/${questionId}`);
			expect(res).toStrictEqual({ retval: error, statusCode: 401 });
		});
	});

	describe('Testing quizId errors (status code 403)', () => {
    test('Returns error when user is not an owner of the quiz', () => {
      const user2 = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'John', nameLast: 'Doe' };
      const user2Res = requestPost(user2, '/v1/admin/auth/register');
      const otherUserToken: string = user2Res.retval.token;

			// user 2 tries to delete user 1's quiz question. 
			const res = requestDelete({ token: otherUserToken }, `/v1/admin/quiz/${quizId}/question/${questionId}`);
      expect(res).toStrictEqual({ retval: error, statusCode: 403 });
    });

		test('Returns error when quiz doesn\'t exist', () => {
      quizId++;
      const res = requestDelete({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}`);
      expect(res).toStrictEqual({ retval: error, statusCode: 403 });
		});
	});
});