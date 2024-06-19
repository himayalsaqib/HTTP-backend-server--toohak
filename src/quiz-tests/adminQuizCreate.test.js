// contains the tests adminQuizCreate from quiz.js

import {adminAuthRegister} from '../auth';
import {adminQuizCreate} from '../quiz';
import {clear} from '../other';

beforeEach(() => {
    clear();
});

describe('adminQuizCreate', () => {
    const error = { error: expect.any(String) };
    let user;
    beforeEach(() => {
        user = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
    });

    describe('Testing for correct return type', () => {
        test('Successful quiz creation with correct return type', () => {
            expect(adminQuizCreate(user.authUserId, "Valid Quiz Name", 
            "Valid quiz description.")).toStrictEqual( {quizId: expect.any(Number)} );
        });
    });
    
    describe('Testing user ID', () => {
        test('Returns error when given invalid user ID', () => {
            expect(adminQuizCreate(user.authUserId + 1, "Valid Quiz Name", 
            "Valid quiz description.")).toStrictEqual(error);
        });
    });

    describe('Testing quiz name errors', () => {
        test('Quiz name contains invalid characters', () => {
            expect(adminQuizCreate(user.authUserId, "Invalid Name @#$%^&*", 
            "Valid quiz description.")).toStrictEqual(error);
        });

        test('Quiz name is less than 3 characters', () => {
            expect(adminQuizCreate(user.authUserId, "Hi", 
            "Valid quiz description.")).toStrictEqual(error);
        });

        test('Quiz name is more than 30 characters', () => {
            expect(adminQuizCreate(user.authUserId, 
                "1234567890 1234567890 1234567890",
                 "Valid quiz description.")).toStrictEqual(error);
        });

        test('Quiz name already used by current user for another quiz', () => {
            adminQuizCreate(user.authUserId, "Name In Use", "Pre existing quiz");
    
            expect(adminQuizCreate(user.authUserId, "Name In Use", 
            "Valid quiz description.")).toStrictEqual(error);
        });
    });
    
    describe('Testing description error', () => {
        const longString = "1234567890 1234567890 1234567890 1234567890 \
                    1234567890 1234567890 1234567890 1234567890 1234567890 1234567890"

        test('Quiz description is more than 100 characters', () => {
            expect(adminQuizCreate(user.authUserId, "Valid Quiz Name", 
            longString)).toStrictEqual(error);
        });
    });
    
    describe('Testing side effect in adminQuizList', () => {
        test('Check if adminQuizList has newly created quizzes', () => {
            adminQuizCreate(user.Id, "Quiz 1", "");
            expect(adminQuizList(user.authUserId).toStrictEqual({ quizzes: 
                [{quizId: expect.any(Number), name: "Quiz 1"}] }));
        });
    });
});
