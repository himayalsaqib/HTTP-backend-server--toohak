// contains HTTP tests for route POST /v1/player/join

import { requestPost } from '../helper-files/requestHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestPost({}, '/v1/clear');
});

describe('POST /v1/player/join', () => {
  let userBody: { name: string };
  
  describe('Testing for correct return type (status code 200)', () => {
    test('Join with non-empty name', () => {
      userBody = { name: 'JohnDoe' };
      const res = requestPost(userBody, '/v1/player/join');
      expect(res).toStrictEqual({
        retval: {
          playerId: expect.any(Number),
          name: 'JohnDoe'
        },
        statusCode: 200
      });
    });

    test('Join with empty name', () => {
      userBody = { name: '' };
      const res = requestPost(userBody, '/v1/player/join');
      expect(res).toStrictEqual({
        retval: {
          playerId: expect.any(Number),
          name: expect.stringMatching(/^[a-zA-Z]{5}\d{3}$/) // Matches pattern [5 letters][3 numbers]
        },
        statusCode: 200
      });
    });
  });
});