// contains the tests adminQuizInfo from quiz.js

import { adminAuthRegister } from '../auth';
import { adminQuizCreate, adminQuizInfo } from '../quiz';
import { clear } from '../other';

let user; 
const error = { error: expect.any(String) };

beforeEach(() => {
    clear();
    user = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
});

describe('adminQuizInfo', () => {
    test('Quiz info was successful and has correct return type', () => {
        const quiz = adminQuizCreate(user.authUserId, quizId)
        expect(adminQuizInfo(user.authUserId, quizId)).toStrictEqual({
            quizid: quizId,
            name: "Valid Quiz Name",
            timeCreated: expect.any(String),
            timeLastEdited: expect.any(String),
            description: "Valid quiz description"
        });
    });

    test('invalid authUserId', () => {
        expect(adminQuizInfo('invalidUser123', quizId)).toStrictEqual(error('AuthUserId is not a valid user.'));
    });

    test('Invalid quizId', () => {
        expect(adminQuizInfo(auth.authUserId, 'invalidQuiz123')).toStrictEqual(error('Quiz ID does not refer to a valid quiz.'));
    });

    test('Quiz not owned by user', () => {
        expect(adminQuizInfo(user.authUserId, quizId)).toStrictEqual(error('Quiz ID does not refer to a quiz that this user owns.'));
    });
});

