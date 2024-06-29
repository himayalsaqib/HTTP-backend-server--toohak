// contains the tests adminQuizCreate from quiz.js

import { requestDelete, requestGet, requestPost } from '../requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/quiz', () => {
  const error = { error: expect.any(String) };
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { sessionId: number, name: string, description: string };
  let token: { sessionId: number, authUserId: number };

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const res = requestGet(userBody, '/v1/admin/auth/register');
    token = res.retval;
  });

  describe('Testing for successful quiz creation', () => {
    quizBody = { sessionId: token.sessionId, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
    const res = requestPost(quizBody, '/v1/admin/quiz');

    test('Has correct return type', () => {
      expect(res.retval.toStrictEqual({ quizId: expect.any(Number) }));
    });

    test.skip('Side effect: quizList returns correct details', () => {
      const listRes = requestGet({ token }, '/v1/admin/quiz/list');
      expect(listRes.retval.toStrictEqual({ quizzes: [{ quizId: res.retval, name: 'Valid Quiz Name' }] }));
    });
  });

  describe('Testing status code 401', () => {
    describe('Testing invalid token', () => {
      test('Returns error when given invalid user ID', () => {
        quizBody.sessionId += 1;
        const res = requestPost(quizBody, '/v1/admin/quiz');
        expect(res.retval.toStrictEqual(error));
        expect(res.statusCode).toStrictEqual(401);
      });

      test('Returns error when token is empty', () => {
        token = { sessionId: null, authUserId: null };
        quizBody.sessionId = token.sessionId;
        const res = requestPost(quizBody, '/v1/admin/quiz');
        
        expect(res.retval.toStrictEqual(error));
        expect(res.statusCode).toStrictEqual(401);
      });
    });
  })

  describe('Testing status code 400', () => {
    describe('Testing quiz name errors', () => {
      test('Quiz name contains invalid characters', () => {
        expect(adminQuizCreate(user.authUserId, 'Invalid Name @#$%^&*',
          'Valid quiz description.')).toStrictEqual(error);
      });
  
      test('Quiz name is less than 3 characters', () => {
        expect(adminQuizCreate(user.authUserId, 'Hi',
          'Valid quiz description.')).toStrictEqual(error);
      });
  
      test('Quiz name is more than 30 characters', () => {
        expect(adminQuizCreate(user.authUserId,
          '1234567890 1234567890 1234567890',
          'Valid quiz description.')).toStrictEqual(error);
      });
  
      test('Quiz name already used by current user for another quiz', () => {
        adminQuizCreate(user.authUserId, 'Name In Use', 'Pre existing quiz');
  
        expect(adminQuizCreate(user.authUserId, 'Name In Use',
          'Valid quiz description.')).toStrictEqual(error);
      });
    });
  
    describe('Testing description error', () => {
      const longString = '1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890';
  
      test('Quiz description is more than 100 characters', () => {
        expect(adminQuizCreate(user.authUserId, 'Valid Quiz Name',
          longString)).toStrictEqual(error);
      });
    });
  });
});
