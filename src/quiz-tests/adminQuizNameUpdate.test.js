// contains the tests for adminNameUpdate from quiz.js
import { adminAuthRegister } from '../auth';
import { adminQuizCreate, adminQuizNameUpdate } from '../quiz';
import { clear } from '../other';

let user;
let quizId;
const error = { error: expect.any(String) };

beforeEach(() => {
  clear();
  user = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
  const quiz = adminQuizCreate(user.authUserId, 'OG Quiz Name', 'Valid quiz description');
  quizId = quiz.quizId;
});

describe('adminQuizNameUpdate', () => {
  describe('Testing for correct return type', () => {
    test('Update quiz name successfully', () => {
        const newName = 'New Quiz Name';
        expect(adminQuizNameUpdate(user.authUserId, quizId, newName)).not.toStrictEqual(error);
    });
  });

  describe('Testing authUserId in adminQuizNameUpdate', () => {
    test('Invalid authUserId', () => {
        expect(adminQuizNameUpdate('invalidUser123', quizId, 'New Name')).toStrictEqual(error);
    });
  });

  describe('Testing quizId in adminQuizNameUpdate', () => {
    test('Invalid quizUserId', () => {
        expect(adminQuizNameUpdate(user.authUserId, 'invalidQuiz123', 'New Name')).toStrictEqual(error);
    });
    test('Quiz not owned by user', () => {
        const otherUser = adminAuthRegister('otheruser@gmail.com', 'Password12', 'Joe', 'Mama');
        const otherQuiz = adminQuizCreate(otherUser.authUserId, "Other User's Quiz", 'Description');
        expect(adminQuizNameUpdate(user.authUserId, otherQuiz.quizId, 'New Name')).toStrictEqual(error);
    });
  });

  describe('Testing name in adminQuizNameUpdate', () => {
    test('Quiz name contains invalid characters', () => {
        expect(adminQuizCreate(user.authUserId, "Invalid Name @#$%^&*")).toStrictEqual(error);
    });

    test('Test: quiz name is less than 3 characters', () => {
        expect(adminQuizCreate(user.authUserId, "Ab")).toStrictEqual(error);
    });

    test('Test: quiz name is more than 30 characters', () => {
        expect(adminQuizCreate(user.authUserId, 
            "This is a really long quiz name way too long123")).toStrictEqual(error);
    });

    test('Name already used by user', () => {
        const anotherQuiz = adminQuizCreate(user.authUserId, 'Another Quiz', 'Description');
        expect(adminQuizNameUpdate(user.authUserId, quizId, 'Another Quiz')).toStrictEqual(error);
    });
  });

});