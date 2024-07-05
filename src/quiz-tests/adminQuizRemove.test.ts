// tests for adminQuizRemove function

import { Tokens } from '../dataStore';
import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('DELETE /v1/admin/quiz/:quizid', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: Tokens, name: string, description: string };
  let token: { sessionId: number, authUserId: number };
  const error = { error: expect.any(String) };

  describe('Testing for correct return type (status code 200)', () => {
    beforeEach(() => {
      userBody = { email: 'userone@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
      const { retval } = requestPost(userBody, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
      quizBody = { token: token, name: 'My Quiz Name', description: 'Valid Quiz Description' };
    });

    test('Successful removal of a quiz', () => {
      const createRes = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = createRes.retval.quizId;
      const removeRes = requestDelete(token, `/v1/admin/quiz/${quizId}`);
      expect(removeRes.retval).toStrictEqual({});
      expect(removeRes.statusCode).toBe(200);
    });

    test('Successful removal of multiple quizzes', () => {
      const res1 = requestPost(quizBody, '/v1/admin/quiz');
      const quizId1 = res1.retval.quizId;
      quizBody = { token: token, name: 'My Quiz Two', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v1/admin/quiz');
      const quizId2 = res2.retval.quizId;

      let removeRes = requestDelete(token, `/v1/admin/quiz/${quizId1}`);
      removeRes = requestDelete(token, `/v1/admin/quiz/${quizId2}`);
      expect(removeRes.statusCode).toBe(200);
      expect(removeRes.retval).toStrictEqual({});
    });

    describe('Testing for invalid and empty token (status code 401', () => {
      test('Returns error when authUserId is not a valid user', () => {
        token.authUserId += 1;
        expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
          retval: error,
          statusCode: 401
        });
      });

      test('Returns error when token is empty', () => {
        requestDelete({}, '/v1/clear');
        expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
          retval: error,
          statusCode: 401
        });
      });

    });

    describe('Testing for valid token but wrong owner and non-existent quiz (status code 403', () => {
      test('Returns error when quiz does not belong to user', () => {
        const userBody2 = { email: 'user2@gmail.com', password: 'Password024', nameFirst: 'User', nameLast: 'Two' };
        const { retval: registerRes2 } = requestPost(userBody2, '/v1/admin/auth/register');
        const token2 = registerRes2 as { sessionId: number, authUserId: number };

        const removeRes = requestDelete({ token: token2 }, `/v1/admin/quiz/{quizid}`);
        expect(removeRes.statusCode).toBe(401);
        expect(removeRes.retval).toStrictEqual(error);
      });

      test('Returns error when quiz does not exist', () => {
        const res = requestPost(quizBody, '/v1/admin/quiz');
        quizBody = { token: token, name: 'My Quiz Two', description: 'Other Quiz Description' };
        const quizId = res.retval.quizId + 1;
        const removeRes = requestDelete(token, `/v1/admin/quiz/${quizId}`);
        expect(removeRes.statusCode).toBe(403);
        expect(removeRes.retval).toStrictEqual(error);
      });

    });
  })
});

// describe('adminQuizRemove', () => {
//   const error = { error: expect.any(String) };
//   let user;
//   let quiz;
//   beforeEach(() => {
//     user = adminAuthRegister('user@gmail.com', 'Password01', 'User',
//       'One').authUserId;
//     quiz = adminQuizCreate(user, 'Quiz 1', 'Description 1').quizId;
//   });

//   test('Has the correct return type', () => {
//     const remove = adminQuizRemove(user, quiz);
//     expect(remove).toStrictEqual({});
//   });

//   describe('Remove quiz from invalid ids returns error', () => {
//     test('Invalid authUserId, valid quizId', () => {
//       const invalidUserId = user + 1;
//       expect(adminQuizRemove(invalidUserId, quiz)).toStrictEqual(error);
//     });

//     test('Valid authUserId, invalid quizId', () => {
//       const invalidQuizId = quiz + 1;
//       expect(adminQuizRemove(user, invalidQuizId))
//         .toStrictEqual(error);
//     });
//   });

//   describe('Returns error when quiz does not belong to user', () => {
//     test('Should not remove valid quiz that does not belong to user ', () => {
//       const user2 = adminAuthRegister('user2@gmail.com', 'Password02', 'User',
//         'Two').authUserId;
//       expect(adminQuizRemove(user2, quiz)).toStrictEqual(error);
//     });
//   });

//   describe('Successful adminQuizRemove', () => {
//     test('Successfully remove a quiz', () => {
//       expect(adminQuizRemove(user, quiz)).toStrictEqual({});
//     });

//     test('Remove a quiz that has already been successfully removed', () => {
//       adminQuizRemove(user, quiz);
//       expect(adminQuizRemove(user, quiz))
//         .toStrictEqual(error);
//     });

//     test('Remove mulitple quizzes', () => {
//       const quiz2 = adminQuizCreate(user, 'Quiz 02', 'Description 02').quizId;
//       expect(adminQuizRemove(user, quiz)).toStrictEqual({});
//       expect(adminQuizRemove(user, quiz2)).toStrictEqual({});
//     });
//   });
// });
