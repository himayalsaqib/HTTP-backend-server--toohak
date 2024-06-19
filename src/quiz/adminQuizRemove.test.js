// tests for adminQuizRemove function 

import {adminQuizCreate, adminQuizRemove} from '../quiz';
import {adminAuthRegister} from '../auth';
import {clear} from '../other';

beforeEach(()=> {
    clear();
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
            const invalidUserId = -1;
            const user = adminAuthRegister('user1@gmail.com', 'Password01', 'User', 'One');
            const quizId = adminQuizCreate(user.authUserId, 'Quiz 1', 'Description 1').quizId;
            const quiz = adminQuizRemove(invalidUserId, quizId);
            expect(quiz).toStrictEqual({error: 'AuthUserId does not refer to a valid user id.'});
        });

        test('Valid authUserId, invalid quizId', () => {
            const user = adminAuthRegister('user@gmail.com', 'Password01', 'First', 'Last');
            const invalidQuizId = -1;

            expect(adminQuizRemove(user.authUserId, invalidQuizId)).
            toStrictEqual({error: 'Quiz Id does not refer to a valid quiz.'});
        });

        test('Invalid authUserId, invalid quizId', () => {
            const invalidUser = -1
            const invalidQuizId = -1;

            expect(adminQuizRemove(invalidUser, invalidQuizId)).
            toStrictEqual({error: 'Invalid User and Quiz Id'});
        });

    });
    

    describe('Quiz does not belong to user', () => {
        test('should not remove valid quiz that does not belong to user ', () => {
            const user1 = adminAuthRegister('user1@gmail.com', 'Password01', 'User', 'One').authUserId;
            const user2 = adminAuthRegister('user2@gmail.com', 'Password02', 'User', 'Two').authUserId;
            const quiz1 = adminQuizCreate(user1, 'Quiz 1', 'Description 1').quizId;
            expect(adminQuizRemove(user2, quiz1)).toStrictEqual({error: 'Quiz does not belong to user'});
        }); 
    });


    describe('Successful adminQuizRemove', () => {

        test('Successfully remove a quiz', () => {
            const user = adminAuthRegister('user@gmail.com', 'Password01', 'userfirst', 'userlast').authUserId;
            const quiz = adminQuizCreate(user, 'Quiz', 'Description').quizId;

            expect(adminQuizRemove(user, quiz)).toStrictEqual({});
        });

        test('Remove a quiz that has already been successfully removed', () => {
            const user = adminAuthRegister('user@gmail.com', 'Password01', 'userfirst', 'userlast').authUserId;
            const quiz = adminQuizCreate(user, 'Quiz', 'Description').quizId;

            adminQuizRemove(user, quiz);

            expect(adminQuizRemove(user, quiz)).
            toStrictEqual({error: "Quiz Id does not refer to a valid quiz."});
        });

        test('Remove mulitple quizzes', () => {
            const user = adminAuthRegister('user@gmail.com', 'Password01', 'userfirst', 'userlast').authUserId;
            const quiz01 = adminQuizCreate(user, 'Quiz 01', 'Description 01').quizId;
            const quiz02 = adminQuizCreate(user, 'Quiz 02', 'Description 02').quizId;

            // adminQuizRemove(user, quiz01);
            //expect(adminQuizRemove(user, quiz01)).toStrictEqual({});
            // adminQuizRemove(user, quiz02);

            expect(adminQuizRemove(user, quiz01)).toStrictEqual({});
            // shoud it print the remaining quiz02
            expect(adminQuizRemove(user, quiz02)).toStrictEqual({});

            // expect(user, quiz01).toStrictEqual({});
            // expect(user, quiz02).toStrictEqual({});
        });

    });

});