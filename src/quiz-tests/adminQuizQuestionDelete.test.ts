// contains HTTP tests for adminQuizQuestionDelete function 

import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('DELETE /v1/admin/quiz/{quizid}/question/{questionid}', () => {
    const error = { error: expect.any(String) };
    let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
    let quizBody: { token: string, name: string, description: string };
    let token: string;
    let answerBody: { answer: string, correct: boolean }[];
    let questionBody: { question: string, duration: number, points: number, answers: { answer: string, correct: boolean }[]  };
	let quizId: number;
	let questionId: number;

beforeEach(() => {
	userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
	const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
	token = registerResponse.retval.token;

	quizBody = { token: token, name: 'Sample Quiz', description: 'Sample Description' };
	const quizResponse = requestPost(quizBody, '/v1/admin/quiz');
	const quizId = quizResponse.retval.quizId;

	answerBody = [
		{ answer: 'Answer 1', correct: false },
		{ answer: 'Answer 2', correct: true },
		{ answer: 'Answer 3', correct: false },
		{ answer: 'Answer 4', correct: false }
	];

	questionBody = {
		question: 'Sample Question?',
		duration: 30,
		points: 10,
		answers: answerBody
	};

	const questionResponse = requestPost(questionBody, `/v1/admin/quiz/${quizId}/question`);
  	const questionId = questionResponse.retval.questionId;

	});
	test('Successfully deletes a question', () => {
		const res = requestDelete({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}`);
		expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
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
			const res = requestDelete({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}`);
			expect(res).toStrictEqual({ retval: error, statusCode: 401
			});
		});
	});

	describe('Testing quizId errors (status code 403)', () => {
    test('Returns error when user is not an owner of the quiz', () => {
      const user2 = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'John', nameLast: 'Doe' };
      //let res = requestPost(user2, '/v1/admin/auth/register');
      //updateBody.token = res.retval.token;

      const res = requestDelete({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}`);
      expect(res).toStrictEqual({ retval: error, statusCode: 403 });
    });



});
});