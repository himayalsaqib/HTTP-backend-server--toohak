// contains the tests for adminQuizNameUpdate from quiz.js
import { adminAuthRegister } from '../auth';
import { adminQuizCreate, adminQuizNameUpdate, adminQuizInfo } from '../quiz';
import { clear } from '../other';

describe('adminQuizNameUpdate', () => {
	const error = { error: expect.any(String) };
	let user;
	let quizId;

	beforeEach(() => {
		clear();
		user = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
		const quiz = adminQuizCreate(user.authUserId, 'Original Quiz Name', 'Valid quiz description');
		quizId = quiz.quizId;
	});

	describe('Testing for correct return type', () => {
		test('Update quiz name successfully', () => {
			const newName = 'New Quiz Name';
			expect(adminQuizNameUpdate(user.authUserId, quizId, newName)).toStrictEqual({});
		});
	});

	describe('Testing side-effects on adminQuizInfo', () => {
    test('Quiz info with updated name was successful and has correct return type', () => {
      adminQuizDescriptionUpdate(user.authUserId, quizId, 'Updated quiz name');
      expect(adminQuizInfo(user.authUserId, quizId)).not.toStrictEqual({
        quizId: quizId,
        name: 'Original Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: undefined,
        description: 'Valid quiz description'
      });
      expect(adminQuizInfo(user.authUserId, quizId)).toStrictEqual({
        quizId: quizId,
        name: 'Updated Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Valid quiz description'
      });      
    });
  });

	describe('Testing authUserId in adminQuizNameUpdate', () => {
		test('Invalid authUserId', () => {
				expect(adminQuizNameUpdate('invalidUser123', quizId, 'New Name')).toStrictEqual(error);
		});
	});

	describe('Testing quizId in adminQuizNameUpdate', () => {
		test('Invalid quizUserId', () => {
				expect(adminQuizNameUpdate(user.authUserId, 'invalidQuiz123', 'New Name')).toStrictEqual(error);
		});
		test('Quiz not owned by user', () => {
				const otherUser = adminAuthRegister('otheruser@gmail.com', 'Password12', 'Joe', 'Mama');
				const otherQuiz = adminQuizCreate(otherUser.authUserId, "Other User's Quiz", 'Description');
				expect(adminQuizNameUpdate(user.authUserId, otherQuiz.quizId, 'New Name')).toStrictEqual(error);
		});
	});

	describe('Testing updated name in adminQuizNameUpdate', () => {
		test('Quiz name contains invalid characters', () => {
				expect(adminQuizNameUpdate(user.authUserId, quizId, "Invalid Name @#$%^&*")).toStrictEqual(error);
		});
		test('Quiz name is less than 3 characters', () => {
				expect(adminQuizNameUpdate(user.authUserId, quizId, "Ab")).toStrictEqual(error);
		});
		test('Quiz name is more than 30 characters', () => {
				expect(adminQuizNameUpdate(user.authUserId, quizId, 
						"This is a really long quiz name way too long123")).toStrictEqual(error);
		});
		test('Name already used by user', () => {
				const anotherQuiz = adminQuizCreate(user.authUserId, 'Another Quiz', 'Description');
				expect(adminQuizNameUpdate(user.authUserId, quizId, 'Another Quiz')).toStrictEqual(error);
		});
	});
});