// contains the tests for all functions in quiz.js

import {adminQuizCreate} from '../quiz';
import {clear} from '../other';

beforeEach(() => {
    clear();
    let users = [{nameFirst: "validFirstName", nameLast: "validLastName", 
                password: "validPassword1", userId: 1, 
                email: "validEmail@gmail.com", numFailedLogins: 0, 
                numSuccessfulLogins: 0
    }];
    let currentUser = users[0];

    let quizzes = [{quizId: 1, name: "Name In Use", timeCreated: 1, 
                timeLastEdited: 1, 
                description: "Pre existing quiz description"
    }];
});

describe('adminCreateQuiz', () => {
    test('Test: successful adminCreateQuiz', () => {
        expect(adminCreateQuiz(currentUser.userId, "Valid Quiz Name", 
        "Valid quiz description.")).toStrictEqual(expect.any(Number));
    });

    test('Test: invalid user ID', () => {
        expect(adminCreateQuiz(0, "Valid Quiz Name", 
        "Valid quiz description.")).toStrictEqual({ error: expect.any(string) });
    });

    test('Test: quiz name contains invalid characters', () => {
        expect(adminCreateQuiz(currentUser.userId, "Invalid Name @#$%^&*", 
        "Valid quiz description.")).toStrictEqual({ error: expect.any(string) });
    });

    test('Test: quiz name is less than 3 characters', () => {
        expect(adminCreateQuiz(currentUser.userId, "Hi", 
        "Valid quiz description.")).toStrictEqual({ error: expect.any(string) });
    });

    test('Test: quiz name is more than 30 characters', () => {
        expect(adminCreateQuiz(currentUser.userId, 
            "1234567890 1234567890 1234567890",
             "Valid quiz description.")).toStrictEqual({ error: expect.any(string) });
    });

    test('Test: quiz name already used by current user for another quiz', () => {
        expect(adminCreateQuiz(currentUser.userId, "Name In Use", 
        "Valid quiz description.")).toStrictEqual({ error: expect.any(string) });
    });

    const longString = "1234567890 1234567890 1234567890 1234567890 1234567890 \
                    1234567890 1234567890 1234567890 1234567890 1234567890"

    test('Test: quiz description is more than 100 characters', () => {
        expect(adminCreateQuiz(currentUser.userId, "Valid Quiz Name", 
        longString)).toStrictEqual({ error: expect.any(string) });
    });
});
