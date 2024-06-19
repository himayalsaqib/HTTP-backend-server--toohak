// contains the tests adminQuizInfo from quiz.js

import { adminAuthRegister } from '../auth';
import { adminQuizCreate, adminQuizDescriptionUpdate, adminQuizInfo, adminQuizNameUpdate } from '../quiz';
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

// add a test case for if quiz was updated and if quiz was not updated

describe('adminQuizInfo', () => {
    test('Quiz info with updated name was successful and has correct return type', () => {
        adminQuizNameUpdate(user.authUserId, quizId, 'Updated Quiz Name');
        expect(adminQuizInfo(user.authUserId, quizId)).toStrictEqual({
            quizId: quizId,
            name: 'Updated Quiz Name',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: 'Valid quiz description'
        });
    });
    test('Quiz info with updated description was successful and has correct return type', () => {
        adminQuizDescriptionUpdate(user.authUserId, quizId, 'Updated quiz description');
        expect(adminQuizInfo(user.authUserId, quizId)).toStrictEqual({
            quizId: quizId,
            name: 'Valid Quiz Name',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: 'Updated quiz description'
        });
    });

    test('Quiz info for new quiz was successful and has correct return type', () => {
        expect(adminQuizInfo(user.authUserId, quizId)).toStrictEqual({
            quizId: quizId,
            name: 'Valid Quiz Name',
            timeCreated: expect.any(Number),
            timeLastEdited: undefined,
            description: 'Valid quiz description'
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

