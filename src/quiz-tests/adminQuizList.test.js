import { adminQuizCreate, adminQuizList, adminQuizRemove } from '../quiz';
import { adminAuthRegister } from '../auth';
import { clear } from '../other';
import { describe, expect, test, beforeEach } from '@jest/globals';

const error = { error: expect.any(String) };

beforeEach(() => {
    clear();
});

describe('adminQuizList', () => {
    describe('has the correct return type', () => {
        test('correctly returns quiz list that contains 1 quiz', () => {
            const user = adminAuthRegister('user1@gmail.com', 'Password01', 'User', 'One').authUserId;
            const quiz = adminQuizCreate(user, 'Quiz 1', 'Description 1').quizId;
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

        test('correctly returns quiz list that contains multiple quizzes', () => {
            const user = adminAuthRegister('user1@gmail.com', 'Password01', 'User', 'One').authUserId;
            const quiz1 = adminQuizCreate(user, 'Quiz 1', 'Description 1').quizId;
            const quiz2 = adminQuizCreate(user, 'Quiz 2', 'Description 2').quizId;
            const list = adminQuizList(user);

            expect(list).toStrictEqual({
                quizzes: [
                    {
                        quizId: quiz1,
                        name: 'Quiz 1'
                    },
                    {
                        quizId: quiz2,
                        name: 'Quiz 2'
                    }
                ]
            });
        });

        test('correctly returns quiz list that contains no quizzes', () => {
            const user = adminAuthRegister('user1@gmail.com', 'Password01', 'User', 'One').authUserId;
            const list = adminQuizList(user);

            expect(list).toStrictEqual({
                quizzes: []
            });
        });
    });

    describe('AuthUserId is not a valid user', () => {
        test('invalid authUserId', () => {
            const user = -1;
            expect(adminQuizList(user)).toStrictEqual({ error: 'AuthUserId does not refer to a valid user id.' });
        });

        test('authUserId is not a registered user', () => {
            const user1 = adminAuthRegister('user1@gmail.com', 'Password01', 'User', 'One').authUserId;
            const user2 = adminAuthRegister('user2@gmail.com', 'Password02', 'User', 'Two').authUserId;
            const quiz1 = adminQuizCreate(user1, 'Quiz 1', 'Description 1').quizId;
            expect(adminQuizList(user2)).toStrictEqual({
                quizzes: []
            });
        });
    });
});