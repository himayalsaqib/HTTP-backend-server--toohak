// includes http tests for the route /v1/admin/quiz/{quizid}/session/{sessionid}

import { requestGet, requestDelete, requestPost, requestPut } from "../helper-files/requestHelper";

beforeEach(() => {
  requestDelete({}, `/v1/clear`);
});

describe('GET /v1/admin/quiz/{quiz}/session/{sessionid}', () => {
  describe('Testing successful cases (status code 200)', () => {
    test.todo('Has the correct return type');

    test.todo('Side-effect tests');
  });

  describe('Testing session ID errors (status code 400)', () => {
    test.todo('The session ID does not refer to a valid session within the quiz');
  });

  describe('Testing token errors (status code 401)', () => {
    test.todo('The token is empty (no users are registered)');

    test.todo('The token is invalid (does not refer to a valid logged in user)');
  });

  describe('Testing quiz ownership and quiz existence errors (status code 403)', () => {
    test.todo('The user is not a owner of the quiz');

    test.todo('This quiz does not exist');
  });
});
