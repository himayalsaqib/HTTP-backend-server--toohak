// contains the tests adminQuizInfo from quiz.js

import { adminAuthRegister } from '../auth';
import { adminQuizCreate, adminQuizDescriptionUpdate, adminQuizInfo, adminQuizNameUpdate } from '../quiz';
import { clear } from '../other';

describe('adminQuizInfo', () => {
	let user; 
	let quizId;
	const error = { error: expect.any(String) };
    
	beforeEach(() => {
		clear();
		user = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
		const quiz = adminQuizCreate(user.authUserId, 'Valid Quiz Name', 'Valid quiz description');
		quizId = quiz.quizId;
	});

	describe('Testing for correct return type', () => {
    test('Quiz info of an edited quiz was successful and has correct return type', () => {
			adminQuizNameUpdate(user.authUserId, quizId, 'Updated Quiz Name');
			expect(adminQuizInfo(user.authUserId, quizId)).toStrictEqual({
				quizId: quizId,
				name: 'Updated Quiz Name',
				timeCreated: expect.any(Number),
				timeLastEdited: expect.any(Number),
				description: 'Valid quiz description'
			});
		});
		
    test('Quiz info for a new quiz was successful and has correct return type', () => {
			expect(adminQuizInfo(user.authUserId, quizId)).toStrictEqual({
				quizId: quizId,
				name: 'Valid Quiz Name',
				timeCreated: expect.any(Number),
				timeLastEdited: undefined,
				description: 'Valid quiz description'
			});
		});
	});

	describe('Testing authUserId in adminQuizInfo', () => {
    test('Invalid authUserId', () => {
			expect(adminQuizInfo('invalidUser123', quizId)).toStrictEqual(error);
    });
	});

	describe('Testing quizId in adminQuizInfo', () => {
    test('Invalid quizId', () => {
			expect(adminQuizInfo(user.authUserId, 'invalidQuiz123')).toStrictEqual(error);
    });
    test('Quiz not owned by user', () => {
			const otherUser = adminAuthRegister('otheruser@gmail.com', 'Password12', 'Joe', 'Mama');
			const otherQuiz = adminQuizCreate(otherUser.authUserId, "Other User's Quiz", "Description");
			expect(adminQuizInfo(user.authUserId, otherQuiz.quizId)).toStrictEqual(error);
    });
	});
});

