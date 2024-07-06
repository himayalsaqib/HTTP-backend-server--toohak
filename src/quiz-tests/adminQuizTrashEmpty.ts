// contains HTTP tests for adminQuizTrashEmpty function 

import { Tokens } from '../dataStore';
import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('DELETE /v1/admin/quiz/trash/empty', () => {
  const error = { error: expect.any(String) };
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: Tokens, name: string, description: string };
  let token: { sessionId: number, authUserId: number };

  let quizIds: number[];

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval as { sessionId: number, authUserId: number };

    // Create 5 quizzes and put them in the trash
    quizIds = [];
    for (let i = 0; i < 5; i++) {
      const quizBody = { token: token, name: `Quiz ${i}`, description: `Description ${i}` };
      const quizResponse = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = quizResponse.retval.quizId;

      requestDelete(token, `/v1/admin/quiz/${quizId}`);
      quizIds.push(quizId);
    }
  });

  describe('Testing for correct return type (status code 200)', () => {
    test('Successfully deletes specific quizzes from trash', () => {
      const quizIdsToDelete = JSON.stringify([quizIds[0], quizIds[1]]);
      const res = requestDelete({ token: token, quizIds: quizIdsToDelete }, '/v1/admin/quiz/trash');
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
  });

    test.skip('Side effect (successful update): adminQuizTrash does not show deleted quizzes', () => {
      const quizIdsToDelete = JSON.stringify([quizIds[0], quizIds[1]]);
      const res = requestDelete({ token: token, quizIds: quizIdsToDelete }, '/v1/admin/quiz/trash');

      requestGet(token, '/v1/admin/quiz/trash');
      expect(res).toStrictEqual({
        quizzes: [
          {
            quizId: quizIds[2],
            name: 'Quiz 2'
          },
          {
            quizId: quizIds[3],
            name: 'Quiz 3'
          },
          {
            quizId: quizIds[4],
            name: 'Quiz 4'
          }
        ]
      });
    });
  });

  describe('Testing error for a quiz that has not been deleted (status code 400)', () => {
    test('Quiz ID refers to a quiz that is not currently in the trash', () => {
      const quizIdsToDelete = JSON.stringify([quizIds[0], quizIds[1]]);
      const res = requestDelete({ token: token, quizIds: quizIdsToDelete }, '/v1/admin/quiz/trash');
      expect(res).toStrictEqual({ retval: error, statusCode: 400 });
    });
  });

});