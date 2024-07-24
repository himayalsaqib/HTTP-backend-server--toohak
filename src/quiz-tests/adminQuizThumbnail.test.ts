// includes http tests for the route /v1/admin/quiz/{quizid}/thumbnail

import { requestDelete, requestPost, requestPut, requestGet } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

const ERROR = { error: expect.any(String) };
const EXAMPLE_IMAGE_URL = 'https://favim.com/pd/p/orig/2019/01/02/miku-shrine-loona-Favim.com-6748464.jpg';
const EXAMPLE_IMAGE_URL_2 = 'http://favim.com/pd/p/orig/2019/01/02/miku-shrine-loona-Favim.com-6748464.jpg';

describe('PUT /v1/admin/quiz/:quizid/thumbnail', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { name: string, description: string };
  let token: string;
  let quizId: number;

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    quizBody = { name: 'Valid Quiz Name', description: 'Valid quiz description' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has correct return type (URL begins with "https://")', () => {
      const res = requestPut({ imgUrl: EXAMPLE_IMAGE_URL }, `/v1/admin/quiz/${quizId}/thumbnail`, { token });
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Has correct return type (URL begins with "http://")', () => {
      const res = requestPut({ imgUrl: EXAMPLE_IMAGE_URL_2 }, `/v1/admin/quiz/${quizId}/thumbnail`, { token });
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect: adminQuizInfo displays updated thumbnail', () => {
      requestPut({ imgUrl: EXAMPLE_IMAGE_URL }, `/v1/admin/quiz/${quizId}/thumbnail`, { token });

      const res = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
      expect(res).toStrictEqual({
        retval: {
          quizId: res.retval.quizId,
          name: 'Valid Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Valid quiz description',
          numQuestions: 0,
          questions: [],
          thumbnailUrl: EXAMPLE_IMAGE_URL,
          duration: 0,
        },
        statusCode: 200
      });
    });

    test('Side effect: adminQuizInfo displays correct timeLastEdited', () => {
      const time = Math.floor(Date.now() / 1000);
      let res = requestPut({ imgUrl: EXAMPLE_IMAGE_URL }, `/v1/admin/quiz/${quizId}/thumbnail`, { token });
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

      res = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
      expect(res.retval.timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(res.retval.timeLastEdited).toBeLessThanOrEqual(time + 1);
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Invalid session ID', () => {
      const sessionId = (parseInt(token) + 1).toString();
      const res = requestPut({ imgUrl: EXAMPLE_IMAGE_URL }, `/v1/admin/quiz/${quizId}/thumbnail`, { token: sessionId });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestPut({ imgUrl: EXAMPLE_IMAGE_URL }, `/v1/admin/quiz/${quizId}/thumbnail`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing quiz ID errors (status code 403)', () => {
    test('User is not an owner of this quiz', () => {
      const newUserBody = { email: 'newvalid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const registerResponse = requestPost(newUserBody, '/v1/admin/auth/register');
      const newToken = registerResponse.retval.token;

      const res = requestPut({ imgUrl: EXAMPLE_IMAGE_URL }, `/v1/admin/quiz/${quizId}/thumbnail`, { token: newToken });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });

    test('Quiz does not exist', () => {
      const res = requestPut({ imgUrl: EXAMPLE_IMAGE_URL }, `/v1/admin/quiz/${quizId + 1}/thumbnail`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });

  describe('Testing imgUrl errors (status code 400)', () => {
    test('The thumbnailUrl is an empty string', () => {
      const thumbnailUrl = '';
      const res = requestPut({ imgUrl: thumbnailUrl }, `/v1/admin/quiz/${quizId}/thumbnail`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('The thumbnailUrl does not end with jpg, jpeg or png', () => {
      const thumbnailUrl = 'https://favim.com/pd/p/orig/2019/01/02/miku-shrine-loona-Favim.com-6748464.csv';
      const res = requestPut({ imgUrl: thumbnailUrl }, `/v1/admin/quiz/${quizId}/thumbnail`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('The thumbnailUrl does not begin with \'http://\' or \'https://\'', () => {
      const thumbnailUrl = 'favim.com/pd/p/orig/2019/01/02/miku-shrine-loona-Favim.com-6748464.jpg';
      const res = requestPut({ imgUrl: thumbnailUrl }, `/v1/admin/quiz/${quizId}/thumbnail`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test.skip('The thumbnailUrl is not a real image', () => {
      const thumbnailUrl = 'http://google.com/some/image/path.jpg';
      const res = requestPut({ imgUrl: thumbnailUrl }, `/v1/admin/quiz/${quizId}/thumbnail`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });
});
