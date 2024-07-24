// includes http tests for the route GET /v1/player/{playerid}/question/{questionposition}/results

import { requestDelete, requestPost } from "./helper-files/requestHelper";
import { QuestionBody } from "./quiz";

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});
  
const ERROR = { error: expect.any(String) };

describe('GET /v1/player/{playerid}/question/{questionposition}/results', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let token: string;
  let quizBody: { name: string, description: string };
  let quizId: number;
  let questionBody: { questionBody: QuestionBody };
  let startSessionBody: { autoStartNum: number };

  beforeEach(() => {
    // registering a user
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    // creating a quiz
    quizBody = { name: 'Quiz Name', description: 'Quiz description' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;

    // creating a quiz question
    questionBody = {
      questionBody: {
        question: 'Who is the Monarch of England?',
        duration: 5,
        points: 5,
        answers: [
          { answer: 'Prince Charles', correct: true },
          { answer: 'Prince William', correct: false }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.png'
      }
    };
    const createResponse = requestPost(questionBody, `/v2/admin/quiz/${quizId}/question`, { token });

    // starting a new session in LOBBY state
    startSessionBody = { autoStartNum: 3 };
    const sessionResponse = requestPost(startSessionBody, `/v1/admin/quiz/${quizId}/session/start`, { token });
  });
})