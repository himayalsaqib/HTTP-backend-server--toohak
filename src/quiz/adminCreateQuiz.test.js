// contains the tests for all functions in quiz.js

import {
    adminQuizList,
    adminQuizCreate,
    adminQuizRemove,
    adminQuizDescriptionUpdate,
    adminQuizInfo,
    adminQuizNameUpdate
} from '../quiz';

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

describe('Test: successful adminCreateQuiz', () => {
    expect(adminCreateQuiz(currentUser.userId, "Valid Quiz Name", "Valid quiz description.")).toStrictEqual(expect.any(Number));
});

describe('Test: invalid user ID', () => {
    expect(adminCreateQuiz(0, "Valid Quiz Name", "Valid quiz description.")).toStrictEqual(expect.any(string));
});

describe('Test: quiz name contains invalid characters', () => {
    expect(adminCreateQuiz(currentUser.userId, "Invalid Name @#$%^&*", "Valid quiz description.")).toStrictEqual(expect.any(string));
});

describe('Test: quiz name is less than 3 characters', () => {
    expect(adminCreateQuiz(currentUser.userId, "Hi", "Valid quiz description.")).toStrictEqual(expect.any(string));
});

describe('Test: quiz name is more than 30 characters', () => {
    expect(adminCreateQuiz(currentUser.userId, "1234567890 1234567890 1234567890", "Valid quiz description.")).toStrictEqual(expect.any(string));
});

describe('Test: quiz name already used by current user for another quiz', () => {
    expect(adminCreateQuiz(currentUser.userId, "Name In Use", "Valid quiz description.")).toStrictEqual(expect.any(string));
});