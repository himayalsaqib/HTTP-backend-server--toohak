// contains the tests for adminQuizDescriptionUpdate from quiz.js
import { adminAuthRegister } from '../auth';
import { adminQuizCreate, adminQuizDescriptionUpdate, adminQuizInfo } from '../quiz';
import { clear } from '../other';

describe('adminQuizDescriptionUpdate', () => {
  const error = { error: expect.any(String) };
  let user;
  let quizId;

  beforeEach(() => {
    clear();
    user = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
    const quiz = adminQuizCreate(user.authUserId, 'Original Quiz Name', 'Valid quiz description');
    quizId = quiz.quizId;
  });

  describe('Testing for correct return type', () => {
    test('Update quiz description successfully', () => {
      expect(adminQuizDescriptionUpdate(user.authUserId, quizId, 'New quiz description')).toStrictEqual({});
    });
  });

  describe('Testing side-effects on adminQuizInfo', () => {
    test('Quiz info with updated description was successful and has correct return type', () => {
      adminQuizDescriptionUpdate(user.authUserId, quizId, 'Updated quiz description');
      expect(adminQuizInfo(user.authUserId, quizId)).not.toStrictEqual({
        quizId: quizId,
        name: 'Original Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: undefined,
        description: 'Valid quiz description'
      });
      expect(adminQuizInfo(user.authUserId, quizId)).toStrictEqual({
        quizId: quizId,
        name: 'Original Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Updated quiz description'
      });      
    });
  });

  describe('Testing authUserId in adminQuizDescriptionUpdate', () => {
    test('Invalid authUserId', () => {
      expect(adminQuizDescriptionUpdate('invalidUser123', quizId, 'New Description')).toStrictEqual(error);
    });
  });

  describe('Testing quizId in adminQuizDescriptionUpdate', () => {
    test('Invalid quizId', () => {
      expect(adminQuizDescriptionUpdate(user.authUserId, 'invalidQuiz123', 'New Description')).toStrictEqual(error);
    });
    test('Quiz not owned by user', () => {
      const otherUser = adminAuthRegister('otheruser@gmail.com', 'Password12', 'Joe', 'Mama');
      const otherQuiz = adminQuizCreate(otherUser.authUserId, "Other User's Quiz", 'Description');
      expect(adminQuizDescriptionUpdate(user.authUserId, otherQuiz.quizId, 'New Description')).toStrictEqual(error);
    });
  });

  describe('Testing description in adminQuizDescriptionUpdate', () => {
    test('Description is more than 100 characters', () => {
      const longDescription = 'Okay deep breath. This is going to be a really really really long quiz description. Like really long. Absurdly inconviently long.';
      expect(adminQuizDescriptionUpdate(user.authUserId, quizId, longDescription)).toStrictEqual(error);
    });
    test('Description exactly 100 characters', () => {
      const description = "This description is exactly 100 characters long and it's used to test the edge case of the function.";
      expect(adminQuizDescriptionUpdate(user.authUserId, quizId, description)).toStrictEqual({});
    });
  });
});