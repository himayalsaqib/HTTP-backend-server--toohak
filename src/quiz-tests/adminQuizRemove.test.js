// tests for adminQuizRemove function 

import {adminQuizCreate, adminQuizRemove} from '../quiz';
import {adminAuthRegister} from '../auth';
import {clear} from '../other';

beforeEach(()=> {
  clear();
});


describe('adminQuizRemove', () => {
  let user;
  let quiz;
  beforeEach(() => {
    user = adminAuthRegister('user@gmail.com', 'Password01', 'User', 'One').authUserId;
    quiz = adminQuizCreate(user, 'Quiz 1', 'Description 1').quizId;
  });

  test('Has the correct return type', () => {
    const remove = adminQuizRemove(user, quiz);
    expect(remove).toStrictEqual({});
  });

  describe('Remove quiz from invalid ids returns error', () => {
    test('Invalid authUserId, valid quizId', () => {
      const invalidUserId = user + 1;
      expect(adminQuizRemove(invalidUserId, quiz)).toStrictEqual({ error: 'AuthUserId does not refer to a valid user id.' });
    });

    test('Valid authUserId, invalid quizId', () => {
      const invalidQuizId = quiz + 1;
      expect(adminQuizRemove(user, invalidQuizId)).
      toStrictEqual({ error: 'Quiz Id does not refer to a valid quiz.' });
    });
  });
  

  describe('Returns error when quiz does not belong to user', () => {
    test('Should not remove valid quiz that does not belong to user ', () => {
      const user2 = adminAuthRegister('user2@gmail.com', 'Password02', 'User', 'Two').authUserId;            
      expect(adminQuizRemove(user2, quiz)).toStrictEqual({ error: 'Quiz does not belong to user' });
    }); 
  });

  
  describe('Successful adminQuizRemove', () => {
    test('Successfully remove a quiz', () => {
      expect(adminQuizRemove(user, quiz)).toStrictEqual({});
    });

    test('Remove a quiz that has already been successfully removed', () => {
      adminQuizRemove(user, quiz);
      expect(adminQuizRemove(user, quiz)).
      toStrictEqual({ error: "Quiz Id does not refer to a valid quiz." });
    });

    test('Remove mulitple quizzes', () => {
      const quiz2 = adminQuizCreate(user, 'Quiz 02', 'Description 02').quizId;
      expect(adminQuizRemove(user, quiz)).toStrictEqual({});
      expect(adminQuizRemove(user, quiz2)).toStrictEqual({});
    });
  });
});