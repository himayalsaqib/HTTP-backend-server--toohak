// tests for adminQuizRemove function 

import { adminQuizCreate, adminQuizRemove } from '../quiz';
import { adminAuthRegister } from '../auth';
import { clear } from '../other';

const error = { error: expect.any(String) };
beforeEach(()=> {
    clear();
});

describe('adminQuizRemove', () => {

  describe('Has the correct return type', () => {
    test('Successfully remove a quiz', () => {
        const user = adminAuthRegister('user@gmail.com', 'Password01', 'userfirst', 'userlast').authUserId;
        const quiz = adminQuizCreate(user, 'Quiz', 'Description').quizId;

        expect(adminQuizRemove(user, quiz)).toStrictEqual({});
        //expect(adminQuizInfo(user, quiz)).ToStrictEqual({error: expecy.any(String)});
    });

    test('Remove mulitple quizzes', () => {
        const user = adminAuthRegister('user@gmail.com', 'Password01', 'userfirst', 'userlast').authUserId;
        const quiz01 = adminQuizCreate(user, 'Quiz 01', 'Description 01').quizId;
        const quiz02 = adminQuizCreate(user, 'Quiz 02', 'Description 02').quizId;

        expect(adminQuizRemove(user, quiz01)).toStrictEqual({});
        expect(adminQuizRemove(user, quiz02)).toStrictEqual({});
    });

});

    describe('Remove quiz from invalid ids returns error', () => {
        test('Invalid authUserId, valid quizId', () => {
            const invalidUserId = -1;
            const user = adminAuthRegister('user1@gmail.com', 'Password01', 'User', 'One');
            const quizId = adminQuizCreate(user.authUserId, 'Quiz 1', 'Description 1').quizId;
            const quiz = adminQuizRemove(invalidUserId, quizId);
            
            expect(quiz).toStrictEqual(error);
        });

        test('Valid authUserId, invalid quizId', () => {
            const user = adminAuthRegister('user@gmail.com', 'Password01', 'First', 'Last');
            const invalidQuizId = -1;

            expect(adminQuizRemove(user.authUserId, invalidQuizId)).
            toStrictEqual(error);
        });

        test('Invalid authUserId, invalid quizId', () => {
            const invalidUser = -1
            const invalidQuizId = -1;

            expect(adminQuizRemove(invalidUser, invalidQuizId)).
            toStrictEqual(error);
        });

    });
    

    describe('Quiz does not belong to user', () => {
        test('should not remove valid quiz that does not belong to user ', () => {
            const user1 = adminAuthRegister('user1@gmail.com', 'Password01', 'User', 'One').authUserId;
            const user2 = adminAuthRegister('user2@gmail.com', 'Password02', 'User', 'Two').authUserId;
            const quiz1 = adminQuizCreate(user1, 'Quiz 1', 'Description 1').quizId;
            
            expect(adminQuizRemove(user2, quiz1)).toStrictEqual(error);
        }); 

        test('Remove a quiz that has already been successfully removed', () => {
            const user = adminAuthRegister('user@gmail.com', 'Password01', 'userfirst', 'userlast').authUserId;
            const quiz = adminQuizCreate(user, 'Quiz', 'Description').quizId;

            adminQuizRemove(user, quiz);

            expect(adminQuizRemove(user, quiz)).
            toStrictEqual(error);
        });
    });

});