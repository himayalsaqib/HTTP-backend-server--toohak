// contains the HTTP tests for adminQuizQuestionMove from quiz.ts

import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

