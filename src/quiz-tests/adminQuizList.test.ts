
import { Tokens } from '../dataStore';
import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper'; // Adjust import based on your helper setup

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/admin/quiz/list', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: Tokens, name: string, description: string };
  let token: { sessionId: number, authUserId: number };

  describe('Testing for correct return type (status code 200)', () => {
    beforeEach(() => {
      userBody = { email: 'user@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One'};
      const { retval } = requestPost(userBody, '/v1/admin/quiz/register');
      token = retval as { sessionId: number, authUserId: number };
      quizBody = { token: token, name: 'My Quiz Name', description: 'Valid Quiz Description' };
    });

    test('Correctly returns quiz list that contains 1 quiz', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      expect(res).toStrictEqual({ 
        retval: { 
          quizzes: [
            {
              quizId: expect.any(Number), 
              name: 'My Quiz Name',
            }
          ]  
        },
      statusCode: 200 
    });
    
    });
    test('Correctly returns quiz list that contains multiple quizzes', () => {
      requestPost(quizBody, '/v1/admin/quiz');
      quizBody = { token: token, name: 'Other Quiz Name', description: 'Other Quiz Description' };
      requestPost(quizBody, '/v1/admin/quiz');
      const res = requestGet(token, '/v1/admin/quiz/list');
      expect(res).toStrictEqual({ 
        retval: { 
          quizzes: [
            {
              quizId: expect.any(Number), 
              name: 'My Quiz Name',
            },
            {
              quizId: expect.any(Number), 
              name: 'Other Quiz Name',
            }
          ]  
        },
        statusCode: 200 
      });
    });

    test('Correctly returns quiz list after a quiz has been removed', () => {
      const res1 = requestPost(quizBody, '/v1/admin/quiz');
      quizBody = { token: token, name: 'Other Quiz Name', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v1/admin/quiz');
      requestDelete({ token: token.token }, `/v1/admin/quiz/${res2.retval.quizId}`);
      const res = requestGet(token, '/v1/admin/quiz/list');
      expect(res).toStrictEqual({ 
        retval: { 
          quizzes: [
            {
              quizId: expect.any(Number), 
              name: 'My Quiz Name',
            }
          ]  
        },
        statusCode: 200 
      });
    });

    test('Correctly returns quiz list that contains no quizzes', () => {
      const res = requestGet(token, '/v1/admin/quiz/list');
      expect(res).toStrictEqual({
        retval: {
          quizzes: []
        },
        statusCode: 200
      });
    });
  });
    });

  });

});

//   describe('Has the correct return type', () => {

//     test('Correctly returns quiz list that contains multiple quizzes', () => {
//       const quiz2 = adminQuizCreate(user, 'Quiz 2', 'Description 2').quizId;
//       const list = adminQuizList(user);
//       expect(list).toStrictEqual({
//         quizzes: [
//           {
//             quizId: quiz,
//             name: 'Quiz 1'
//           },
//           {
//             quizId: quiz2,
//             name: 'Quiz 2'
//           }
//         ]
//       });
//     });

//     test('Correctly returns quiz list after a quiz has been removed', () => {
//       const quiz2 = adminQuizCreate(user, 'Quiz 2', 'Description 2').quizId;
//       adminQuizRemove(user, quiz2);
//       const list = adminQuizList(user);
//       expect(list).toStrictEqual({
//         quizzes: [
//           {
//             quizId: quiz,
//             name: 'Quiz 1'
//           }
//         ]
//       });
//     });

//     test('Correctly returns quiz list that contains no quizzes', () => {
//       clear();
//       user = adminAuthRegister('user@gmail.com', 'Password01', 'User', 'One').authUserId;
//       const list = adminQuizList(user);
//       expect(list).toStrictEqual({
//         quizzes: []
//       });
//     });
//   });

//   describe('Returns error when authUserId is not a valid user', () => {
//     test('Invalid authUserId', () => {
//       const user1 = user + 1;
//       expect(adminQuizList(user1)).toStrictEqual({ error: expect.any(String) });
//     });
//   });
// });
