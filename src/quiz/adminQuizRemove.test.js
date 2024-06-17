// tests for adminQuizRemove function 

import {adminQuizCreate, adminQuizRemove} from '../quiz';
import {adminAuthRegister} from '../auth';
import {clear} from '../other';

beforeEach(()=> {
    clear();
});

describe('clear', () => {
    test('has the correct return type, {}', () => {
      expect(clear()).toStrictEqual({});
    });
  });

describe('adminQuizRemove', () => {

  test('has the correct return type', () => {
    const user = adminAuthRegister('user1@gmail.com', 'Password01', 'User', 'One');
    const quiz = adminQuizCreate(user.authUserId, 'Quiz 1', 'Description 1');
    const remove = adminQuizRemove(user.authUserId, quiz.quizId);
    expect(remove).toStrictEqual({});
  });

    describe('Remove quiz from invalid ids returns error', () => {
        test('Invalid authUserId, valid quizId', () => {
            const invalidUser = -1;
            const quiz = adminQuizRemove(invalidUserId, 1);

            expect(quiz.strictEqual({error: 'Invalid User Id'}));
        });

        test('Valid user, invalid quizId', () => {
            const user = adminAuthRegister('user@gmail.com', 'Password01', 'First', 'Last');
            const invalidQuiz = -1;

            expect(adminQuizRemove(user.authUserId, invalidQuizId).
            toStrictEqual({error: 'Invalid Quiz Id'}));
        });

        test('Invalid user, invalid quizId', () => {
            const invalidUser = -1
            const invalidQuiz = -1;

            expect(adminQuizRemove(invalidUser, invalidQuiz).
            toStrictEqual({error: 'Invalid User and Quiz Id'}));
        });

    });
    

    describe('Quiz does not belong to user', () => {
        test('should not remove valid quiz that does not belong to user ', () => {
            const user1 = adminAuthRegister('user1@gmail.com', 'Password01', 'User', 'One');
            const user2 = adminAuthRegister('user2@gmail.com', 'Password02', 'User', 'Two');
            const quiz1 = adminQuizCreate(user1.authUserId, 'Quiz 1', 'Description 1');

            expect(adminQuizRemove(user2, quiz1.quizId)).
            toStrictEqual({error: 'Quiz does not belong to user'});
        }); 
    });


    describe('Successful adminQuizRemove', () => {

        test('Successfully remove a quiz', () => {
            const user = adminAuthRegister('user@gmail.com', 'Password01', 'userfirst', 'userlast');
            const quiz = adminQuizCreate(user.authUserId, 'Quiz', 'Description');

            expect(adminQuizRemove(user.authUserId, quiz.quizId)).toStrictEqual({});
        });

        test('Remove a quiz that has already been successfully removed', () => {
            const user = adminAuthRegister('user@gmail.com', 'Password01', 'userfirst', 'userlast');
            const quiz = adminQuizCreate(user.authUserId, 'Quiz', 'Description');

            adminQuizRemove(user.authUserId, quiz.quizId);

            expect(adminQuizRemove(user.authUserId, quiz.quizId)).
            toStrictEqual({error: "Quiz does not exist"});
        });

        test('Remove mulitple quizzes', () => {
            const user = adminAuthRegister('user@gmail.com', 'Password01', 'userfirst', 'userlast');
            const quiz01 = adminQuizCreate(user.authUserId, 'Quiz 01', 'Description 01');
            const quiz02 = adminQuizCreate(user.authUserId, 'Quiz 02', 'Description 02');

            adminQuizRemove(user.authUserId, quiz01.quizId);
            adminQuizRemove(user.authUserId, quiz02.quizId);

            expect(adminQuizRemove(user.authUserId, quiz01.quizId)).toStrictEqual({});
            expect(adminQuizRemove(user.authUserId, quiz02.quizId)).toStrictEqual({});
        });

    });

});