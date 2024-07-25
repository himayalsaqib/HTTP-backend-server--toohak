// includes http tests for the route /v1/admin/quiz/{quizid}/session/{sessionid}/results

import { requestGet, requestDelete, requestPost, requestPut } from "../helper-files/requestHelper";

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});
