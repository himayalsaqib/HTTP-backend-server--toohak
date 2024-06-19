// contains the tests adminQuizInfo from quiz.js

import { adminAuthRegister } from '../auth';
import { adminQuizCreate, adminQuizInfo } from '../quiz';
import { clear } from '../other';

let user; 
let quizId;
const error = { error: expect.any(String) };

beforeEach(() => {
    clear();
    user = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
    const quiz = adminQuizCreate(user.authUserId, 'Valid Quiz Name', 'Valid quiz description');
    quizId = quiz.quizId;
});

describe('adminQuizInfo', () => {
    test('Quiz info was successful and has correct return type', () => {
        expect(adminQuizInfo(user.authUserId, quizId)).toStrictEqual({
            quizId: quizId,
            name: "Valid Quiz Name",
            timeCreated: expect.any(String),
            timeLastEdited: undefined,
            description: "Valid quiz description"
        });
    });

    test('Invalid authUserId', () => {
        expect(adminQuizInfo('invalidUser123', quizId)).toStrictEqual(error);
    });

    test('Invalid quizId', () => {
        expect(adminQuizInfo(user.authUserId, 'invalidQuiz123')).toStrictEqual(error);
    });

    test('Quiz not owned by user', () => {
        const otherUser = adminAuthRegister('otheruser@gmail.com', 'Password12', 'Joe', 'Mama');
        const otherQuiz = adminQuizCreate(otherUser.authUserId, "Other User's Quiz", "Description");
        expect(adminQuizInfo(user.authUserId, otherQuiz.quizId)).toStrictEqual(error);
    });

    test('Quiz owned by user', () => {
        expect(adminQuizInfo(user.authUserId, quizId)).not.toStrictEqual(error);
    });
});

