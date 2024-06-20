import { adminQuizCreate, adminQuizList, adminQuizRemove } from '../quiz';
import { adminAuthRegister } from '../auth';
import { clear } from '../other';

beforeEach(() => {
  clear();
});

describe('AdminQuizList', () => {
	let user;
  let quiz;
  beforeEach(() => {
		user = adminAuthRegister('user@gmail.com', 'Password01', 'User', 'One').authUserId;
		quiz = adminQuizCreate(user, 'Quiz 1', 'Description 1').quizId;
  });

  describe('Has the correct return type', () => {
    test('Correctly returns quiz list that contains 1 quiz', () => {
			const list = adminQuizList(user);
			expect(list).toStrictEqual({
			quizzes: [
				{
					quizId: quiz,
					name: 'Quiz 1'
				}
			]
			});
		});

		test('Correctly returns quiz list that contains multiple quizzes', () => {
			const quiz2 = adminQuizCreate(user, 'Quiz 2', 'Description 2').quizId;
			const list = adminQuizList(user);
			expect(list).toStrictEqual({
				quizzes: [
					{
						quizId: quiz,
						name: 'Quiz 1'
					},
					{
						quizId: quiz2,
						name: 'Quiz 2'
					}
				]
			});
		});

		test('Correctly returns quiz list after a quiz has been removed', () => {
			const quiz2 = adminQuizCreate(user, 'Quiz 2', 'Description 2').quizId;
			adminQuizRemove(user, quiz2);
			const list = adminQuizList(user);
			expect(list).toStrictEqual({
				quizzes: [
					{
						quizId: quiz,
						name: 'Quiz 1'
					}
				]
			});
		});
		
		test('Correctly returns quiz list that contains no quizzes', () => {
			clear(); 
			user = adminAuthRegister('user@gmail.com', 'Password01', 'User', 'One').authUserId;
      const list = adminQuizList(user);
      expect(list).toStrictEqual({
        quizzes: []
				});
		});
	});

    describe('Returns error when authUserId is not a valid user', () => {
			test('Invalid authUserId', () => {
				const user1 = user + 1;
				expect(adminQuizList(user1)).toStrictEqual({ error: 'AuthUserId does not refer to a valid user id.' });
			});
    });
});
