// contains the tests for all functions in quiz.js

import {adminQuizCreate} from '../quiz';
import {clear} from '../other';

beforeEach(() => {
    clear();
    const user = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
});

describe('adminCreateQuiz', () => {
    test('Test: successful adminCreateQuiz', () => {
        expect(adminCreateQuiz(user.authUserId, "Valid Quiz Name", 
        "Valid quiz description.")).toStrictEqual(expect.any(Number));
    });

    test('Test: invalid user ID', () => {
        expect(adminCreateQuiz(-1, "Valid Quiz Name", 
        "Valid quiz description.")).toStrictEqual({ error: expect.any(string) });
    });

    test('Test: quiz name contains invalid characters', () => {
        expect(adminCreateQuiz(user.authUserId, "Invalid Name @#$%^&*", 
        "Valid quiz description.")).toStrictEqual({ error: expect.any(string) });
    });

    test('Test: quiz name is less than 3 characters', () => {
        expect(adminCreateQuiz(user.authUserId, "Hi", 
        "Valid quiz description.")).toStrictEqual({ error: expect.any(string) });
    });

    test('Test: quiz name is more than 30 characters', () => {
        expect(adminCreateQuiz(user.authUserId, 
            "1234567890 1234567890 1234567890",
             "Valid quiz description.")).toStrictEqual({ error: expect.any(string) });
    });

    test('Test: quiz name already used by current user for another quiz', () => {
        adminCreateQuiz(user.Id, "Name In Use", "Pre existing quiz");

        expect(adminCreateQuiz(user.authUserId, "Name In Use", 
        "Valid quiz description.")).toStrictEqual({ error: expect.any(string) });
    });

    const longString = "1234567890 1234567890 1234567890 1234567890 1234567890 \
                    1234567890 1234567890 1234567890 1234567890 1234567890"

    test('Test: quiz description is more than 100 characters', () => {
        expect(adminCreateQuiz(user.authUserId, "Valid Quiz Name", 
        longString)).toStrictEqual({ error: expect.any(string) });
    });
});
