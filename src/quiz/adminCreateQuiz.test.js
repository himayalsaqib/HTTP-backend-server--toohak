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
});

describe('Test successful adminCreateQuiz', () => {
    expect(adminCreateQuiz(currentUser.userId, "Valid Quiz Name", "Valid quiz description.")).toStrictEqual(expect.any(Number));
});

describe('Test unsuccessful adminCreateQuiz', () => {

});