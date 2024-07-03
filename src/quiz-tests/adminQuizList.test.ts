
import { Tokens } from '../dataStore';
import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper'; // Adjust import based on your helper setup

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/admin/quiz/list', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: Tokens, name: string, description: string };
  let token: { sessionId: number, authUserId: number };
  const error = { error: expect.any(String) };

  describe('Testing for correct return type (status code 200)', () => {
    beforeEach(() => {
      userBody = { email: 'user@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One'};
      const { retval } = requestPost(userBody, '/v1/admin/quiz/register');
      token = retval as { sessionId: number, authUserId: number };
      quizBody = { token: token, name: 'My Quiz Name', description: 'Valid Quiz Description' };
    });

    test('Correctly returns quiz list that contains 1 quiz', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      const listRes = requestGet({ token }, '/v1/admin/quiz/list');
      expect(listRes).toStrictEqual({ 
        retval: { 
          quizzes: [
            {
              quizId: res.retval, 
              name: 'My Quiz Name',
            }
          ]  
        },
        statusCode: 200 
      });
    });

    test('Correctly returns quiz list that contains multiple quizzes', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      quizBody = { token: token, name: 'My Quiz Two', description: 'Other Quiz Description' }
      const res2 = requestPost(quizBody, '/v1/admin/quiz');
      const listRes = requestGet({ token }, '/v1/admin/quiz/list');
      expect(listRes).toStrictEqual({ 
        retval: { 
          quizzes: [
            {
              quizId: res.retval, 
              name: 'My Quiz Name',
            },
            {
              quizId: res2.retval, 
              name: 'My Quiz Two',
            }
          ]
        },
        statusCode: 200
      });
    });

    test.skip('Correctly returns quiz list after a quiz has been removed', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      quizBody = { token: token, name: 'My Quiz Two', description: 'Other Quiz Description' }
      const res2 = requestPost(quizBody, '/v1/admin/quiz');
      requestDelete(token, res2.retval);
      const listRes = requestGet({ token }, '/v1/admin/quiz/list');
      expect(listRes).toStrictEqual({ 
        retval: { 
          quizzes: [
            {
              quizId: res.retval, 
              name: 'My Quiz Name',
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Correctly returns quiz list that contains no quizzes', () => {
      requestDelete({}, '/v1/clear');
      const listRes = requestGet({ token }, '/v1/admin/quiz/list');
      expect(listRes).toStrictEqual({ 
        retval: { 
          quizzes: []  
        },
        statusCode: 200 
      });
    });
  });

  describe('Testing for invaliduser (status code 401)', () => {
    test('Returns error when authUserId is not a valid user', () => {
    token.authUserId += 1;
    expect(requestGet(token, '/v1/admin/user/details')).toStrictEqual({
      retval: error,
      statusCode: 401
    });
  });
});
});

