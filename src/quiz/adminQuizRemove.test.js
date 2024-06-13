// tests for adminQuizRemove.js 

import {adminQuizCreate, adminQuizRemove} from '../quiz';
import {adminAuthRegister} from '../auth';
import {clear} from '../other';

beforeEach(()=> {
    clear();
});


describe('adminQuizRemove', () => {
    test('Invalid authUserId', () => {
        const invalidUserId = -1;
        const quiz = adminQuizRemove(invalidUserId, 1);
        expect(quiz.strictEqual({error: 'Invalid user Id'}));
    });

    test('Invalid quizId', () => {
        const user = adminAuthRegister('user@gmail.com', 'Password01', 'First', 'Last');
        const invalidQuizId = -1;
        expect(adminQuizRemove(user, invalidQuizId).toStrictEqual({error: 'Invalid Quiz Id'}));
    });
});


describe('adminQuizRemove', () => {
    test('Quiz does not belong to user', () => {
        const user1 = adminAuthRegister('user1@gmail.com', 'Password01', 'Fuserone', 'Luserone');
        const user2 = adminAuthRegister('user2@gmail.com', 'Password02', 'Fusertwo', 'Lusertwo');
        const quiz1 = adminQuizCreate(user1.authUserId, 'Quiz 1', 'Description 1');
        expect(adminQuizRemove(user2, quiz1.quizId)).toStrictEqual({error: 'Quiz does not belong to user'});
    });
});

describe('Successful adminQuizRemove returns empty object', () => {
    test('Successfully remove quiz', () => {
        const user01 = adminAuthRegister('user@gmail.com', 'Password01', 'userfirst', 'userlast');
        const quiz01 = adminQuizCreate(user1.authUserId, 'Quiz 01', 'Description 01');
        expect(adminQuizRemove(user.authUserId, quiz.quizId)).toStrictEqual({});
    });

});