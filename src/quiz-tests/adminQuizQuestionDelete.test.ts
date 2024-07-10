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
		//const res = requestDelete({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}`);

	});

});