// includes http tests for the route POST /v1/admin/quiz/{quizid}/session/{sessionid}

import { requestDelete } from "../helper-files/requestHelper";

beforeEach(() => {
	requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/quiz/{quizid}/session/{sessionid}', () => {
	const error = { error: expect.any(String) };
	
});
