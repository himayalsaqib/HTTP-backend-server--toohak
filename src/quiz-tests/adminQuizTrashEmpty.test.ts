// contains HTTP tests for route DELETE /v1/admin/quiz/trash/empty and /v2/admin/quiz/trash/empty

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('DELETE /v1/admin/quiz/trash/empty', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  let token: string;
  let quizIds: number[];

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    // Create 5 quizzes and put them in the trash
    quizIds = [];
    for (let i = 0; i < 5; i++) {
      quizBody = { token: token, name: `Quiz ${i}`, description: `Description ${i}` };
      const quizResponse = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = quizResponse.retval.quizId;

      requestDelete({ token }, `/v1/admin/quiz/${quizId}`);
      quizIds.push(quizId);
    }
  });

  describe('Testing for correct return type (status code 200)', () => {
    test('Has correct return type', () => {
      const quizIdsToDelete = JSON.stringify([quizIds[0], quizIds[1]]);
      const res = requestDelete({ token, quizIds: quizIdsToDelete }, '/v1/admin/quiz/trash/empty');
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect (successful update): adminQuizTrash does not show permanently deleted quizzes', () => {
      const quizIdsToDelete = JSON.stringify([quizIds[0], quizIds[1]]);
      requestDelete({ token: token, quizIds: quizIdsToDelete }, '/v1/admin/quiz/trash/empty');

      const trashRes = requestGet({ token }, '/v1/admin/quiz/trash');
      expect(trashRes).toStrictEqual({
        retval: {
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
        },
        statusCode: 200
      });
    });
  });

  describe('Testing error for a quiz that has not been deleted (status code 400)', () => {
    test('One or more of the Quiz IDs is not currently in the trash', () => {
      quizBody = { token: token, name: 'Quiz 5', description: 'Description 5' };
      const quiz6Response = requestPost(quizBody, '/v1/admin/quiz');
      const nonDeletedQuiz1 = quiz6Response.retval.quizId;

      quizBody = { token: token, name: 'Quiz 6', description: 'Description 6' };
      const quiz7Response = requestPost(quizBody, '/v1/admin/quiz');
      const nonDeletedQuiz2 = quiz7Response.retval.quizId;

      const quizIdsInTrash = [quizIds[0], quizIds[1]];
      const mixedQuizIds = JSON.stringify([...quizIdsInTrash, nonDeletedQuiz1, nonDeletedQuiz2]);

      const res = requestDelete({ token: token, quizIds: mixedQuizIds }, '/v1/admin/quiz/trash/empty');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Given invalid session ID', () => {
      token += '1';
      const quizIdsToDelete = JSON.stringify([quizIds[0], quizIds[1]]);
      const res = requestDelete({ token: token, quizIds: quizIdsToDelete }, '/v1/admin/quiz/trash/empty');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const quizIdsToDelete = JSON.stringify([quizIds[0], quizIds[1]]);
      const res = requestDelete({ token: token, quizIds: quizIdsToDelete }, '/v1/admin/quiz/trash/empty');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing quizId errors (status code 403)', () => {
    test('One or more of the Quiz IDs refers to a quiz that this current user does not own', () => {
      // Register otherUser
      const otherUserBody = { email: 'otherUser@gmail.com', password: 'Password23', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const otherUserResponse = requestPost(otherUserBody, '/v1/admin/auth/register');
      const otherUserToken: string = otherUserResponse.retval.token;

      // otherUser creates 2 quizzes and puts them in trash
      quizBody = { token: otherUserToken, name: 'Other user quiz 1', description: 'Other user description 1' };
      const quizResponse1 = requestPost(quizBody, '/v1/admin/quiz');
      const otherUserQuiz1 = quizResponse1.retval.quizId;
      requestDelete({ token: otherUserToken }, `/v1/admin/quiz/${otherUserQuiz1}`);

      quizBody = { token: token, name: 'Other user quiz 2', description: 'Other user description 2' };
      const quizResponse2 = requestPost(quizBody, '/v1/admin/quiz');
      const otherUserQuiz2 = quizResponse2.retval.quizId;
      requestDelete({ token: otherUserToken }, `/v1/admin/quiz/${otherUserQuiz2}`);

      // Current user attempts to delete 2 own quizzes and 2 otherUser quizzes
      const userQuizIdsDelete = [quizIds[1], quizIds[2]];
      const mixedQuizIds = JSON.stringify([...userQuizIdsDelete, otherUserQuiz1, otherUserQuiz2]);

      const res = requestDelete({ token: token, quizIds: mixedQuizIds }, '/v1/admin/quiz/trash/empty');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
    test("One or more of the Quiz IDs refers to a quiz that doesn't exist", () => {
      requestDelete({}, '/v1/clear');

      // Register a user
      userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
      token = registerResponse.retval.token;

      // Create one quiz
      quizBody = { token: token, name: 'Quiz 1', description: 'Description 1' };
      const quizResponse = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = quizResponse.retval.quizId;

      // Put quiz in trash
      requestDelete({ token }, `/v1/admin/quiz/${quizId}`);
      quizIds.push(quizId);

      // Delete a quiz that does not exist
      const quizIdsToDelete = JSON.stringify([quizIds[1] + 1]);

      const res = requestDelete({ token: token, quizIds: quizIdsToDelete }, '/v1/admin/quiz/trash/empty');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });
});

describe('DELETE /v2/admin/quiz/trash/empty', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { name: string, description: string };
  let token: string;
  let quizIds: number[];

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    // Create 5 quizzes and put them in the trash
    quizIds = [];
    for (let i = 0; i < 5; i++) {
      quizBody = { name: `Quiz ${i}`, description: `Description ${i}` };
      const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
      const quizId = quizResponse.retval.quizId;

      requestDelete({ token }, `/v1/admin/quiz/${quizId}`); // change to v2
      quizIds.push(quizId);
    }
  });

  describe('Testing for correct return type (status code 200)', () => {
    test('Has correct return type', () => {
      const quizIdsToDelete = JSON.stringify([quizIds[0], quizIds[1]]);
      const res = requestDelete({ quizIds: quizIdsToDelete }, '/v2/admin/quiz/trash/empty', { token });
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect (successful update): adminQuizTrash does not show permanently deleted quizzes', () => {
      const quizIdsToDelete = JSON.stringify([quizIds[0], quizIds[1]]);
      requestDelete({ quizIds: quizIdsToDelete }, '/v2/admin/quiz/trash/empty', { token });

      const trashRes = requestGet({ token }, '/v1/admin/quiz/trash'); // change to v2
      expect(trashRes).toStrictEqual({
        retval: {
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
        },
        statusCode: 200
      });
    });
  });

  describe('Testing error for a quiz that has not been deleted (status code 400)', () => {
    test('One or more of the Quiz IDs is not currently in the trash', () => {
      quizBody = { name: 'Quiz 5', description: 'Description 5' };
      const quiz6Response = requestPost(quizBody, '/v2/admin/quiz', { token });
      const nonDeletedQuiz1 = quiz6Response.retval.quizId;

      quizBody = { name: 'Quiz 6', description: 'Description 6' };
      const quiz7Response = requestPost(quizBody, '/v2/admin/quiz', { token });
      const nonDeletedQuiz2 = quiz7Response.retval.quizId;

      const quizIdsInTrash = [quizIds[0], quizIds[1]];
      const mixedQuizIds = JSON.stringify([...quizIdsInTrash, nonDeletedQuiz1, nonDeletedQuiz2]);

      const res = requestDelete({ quizIds: mixedQuizIds }, '/v2/admin/quiz/trash/empty', { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Given invalid session ID', () => {
      token += '1';
      const quizIdsToDelete = JSON.stringify([quizIds[0], quizIds[1]]);
      const res = requestDelete({ quizIds: quizIdsToDelete }, '/v2/admin/quiz/trash/empty', { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const quizIdsToDelete = JSON.stringify([quizIds[0], quizIds[1]]);
      const res = requestDelete({ quizIds: quizIdsToDelete }, '/v1/admin/quiz/trash/empty', { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing quizId errors (status code 403)', () => {
    test('One or more of the Quiz IDs refers to a quiz that this current user does not own', () => {
      // Register otherUser
      const otherUserBody = { email: 'otherUser@gmail.com', password: 'Password23', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const otherUserResponse = requestPost(otherUserBody, '/v1/admin/auth/register');
      const otherUserToken: string = otherUserResponse.retval.token;

      // otherUser creates 2 quizzes and puts them in trash
      quizBody = { name: 'Other user quiz 1', description: 'Other user description 1' };
      const quizResponse1 = requestPost(quizBody, '/v2/admin/quiz', { token: otherUserToken });
      const otherUserQuiz1 = quizResponse1.retval.quizId;
      requestDelete({ token: otherUserToken }, `/v1/admin/quiz/${otherUserQuiz1}`);

      quizBody = { name: 'Other user quiz 2', description: 'Other user description 2' };
      const quizResponse2 = requestPost(quizBody, '/v2/admin/quiz', { token });
      const otherUserQuiz2 = quizResponse2.retval.quizId;
      requestDelete({ token: otherUserToken }, `/v1/admin/quiz/${otherUserQuiz2}`); // change to v2

      // Current user attempts to delete 2 own quizzes and 2 otherUser quizzes
      const userQuizIdsDelete = [quizIds[1], quizIds[2]];
      const mixedQuizIds = JSON.stringify([...userQuizIdsDelete, otherUserQuiz1, otherUserQuiz2]);

      const res = requestDelete({ quizIds: mixedQuizIds }, '/v2/admin/quiz/trash/empty', { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
    test("One or more of the Quiz IDs refers to a quiz that doesn't exist", () => {
      requestDelete({}, '/v1/clear');

      // Register a user
      userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
      token = registerResponse.retval.token;

      // Create one quiz
      quizBody = { name: 'Quiz 1', description: 'Description 1' };
      const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
      const quizId = quizResponse.retval.quizId;

      // Put quiz in trash
      requestDelete({ token }, `/v1/admin/quiz/${quizId}`); // v2 change
      quizIds.push(quizId);

      // Delete a quiz that does not exist
      const quizIdsToDelete = JSON.stringify([quizIds[1] + 1]);

      const res = requestDelete({ quizIds: quizIdsToDelete }, '/v2/admin/quiz/trash/empty', { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });
});
