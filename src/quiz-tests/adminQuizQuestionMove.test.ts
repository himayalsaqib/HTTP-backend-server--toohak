// includes http tests for the route /v1/admin/quiz/{quizid}/question/{questionid}/move
// and /v2/admin/quiz/{quizid}/question/{questionid}/move

import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

const ERROR = { error: expect.any(String) };

describe('/v1/admin/quiz/{quizid}/question/{questionid}/move', () => {
  let quizId: number;
  let token: string;
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  let questionId: number[] = [];

  beforeEach(() => {
    questionId = [];
    // register a user to create a quiz
    userBody = { email: 'valid@gmail.com', password: 'ValidPass123', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerUser = requestPost(userBody, '/v1/admin/auth/register');
    token = registerUser.retval.token;

    // create the quiz
    quizBody = { token: token, name: 'Valid Quiz Name', description: 'A valid quiz description' };
    const res = requestPost(quizBody, '/v1/admin/quiz');
    quizId = res.retval.quizId;

    // create first question
    const answerBody = [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince William', correct: false }];
    const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answerBody };
    const newQuestionId = requestPost({ token: token, questionBody: questionCreateBody }, `/v1/admin/quiz/${quizId}/question`);
    questionId.push(newQuestionId.retval.questionId);
  });

  describe('Testing successful cases (status code 200)', () => {
    beforeEach(() => {
      // create second question
      const answerBody2 = [{ answer: 'Chappell Roan', correct: true }, { answer: 'Sabrina Carpenter', correct: false }];
      const questionCreateBody2 = { question: 'Who is your favourite artist\'s favourite artist?', duration: 5, points: 6, answers: answerBody2 };
      let newQuestionId = requestPost({ token: token, questionBody: questionCreateBody2 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval.questionId);

      // create third question
      const answerBody3 = [{ answer: 'Brat summer', correct: true }, { answer: 'The Industrial Revolution', correct: false }];
      const questionCreateBody3 = { question: 'Which has had the greatest cultural impact?', duration: 6, points: 7, answers: answerBody3 };
      newQuestionId = requestPost({ token: token, questionBody: questionCreateBody3 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval.questionId);

      // create fourth question
      const answerBody4 = [{ answer: 'Trisha/Ethan', correct: true }, { answer: 'Enya/Drew', correct: false }];
      const questionCreateBody4 = { question: 'Who should work it out on the remix next?', duration: 7, points: 8, answers: answerBody4 };
      newQuestionId = requestPost({ token: token, questionBody: questionCreateBody4 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval.questionId);
    });

    test('Has correct return type', () => {
      // swap second and fourth question
      const moveBody = { token: token, newPosition: 1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[3]}/move`);

      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect: adminQuizinfo displays successful swap of second with fourth question', () => {
      const moveBody = { token: token, newPosition: 1 };
      requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[3]}/move`);

      expect(requestGet({ token: token }, `/v1/admin/quiz/${quizId}`)).toStrictEqual({
        retval: {
          quizId: quizId,
          name: quizBody.name,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: quizBody.description,
          numQuestions: 4,
          questions: [
            {
              questionId: questionId[0],
              question: 'Who is the Monarch of England?',
              duration: 4,
              points: 5,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Prince Charles',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Prince William',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId[3],
              question: 'Who should work it out on the remix next?',
              duration: 7,
              points: 8,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Trisha/Ethan',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Enya/Drew',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId[2],
              question: 'Which has had the greatest cultural impact?',
              duration: 6,
              points: 7,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Brat summer',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'The Industrial Revolution',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId[1],
              question: 'Who is your favourite artist\'s favourite artist?',
              duration: 5,
              points: 6,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Chappell Roan',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Sabrina Carpenter',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            }
          ],
          duration: 22
        },
        statusCode: 200
      });
    });

    test('Side effect: adminQuizinfo displays successful swap of fourth with second question', () => {
      const moveBody = { token: token, newPosition: 3 };
      requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[1]}/move`);

      expect(requestGet({ token: token }, `/v1/admin/quiz/${quizId}`)).toStrictEqual({
        retval: {
          quizId: quizId,
          name: quizBody.name,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: quizBody.description,
          numQuestions: 4,
          questions: [
            {
              questionId: questionId[0],
              question: 'Who is the Monarch of England?',
              duration: 4,
              points: 5,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Prince Charles',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Prince William',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId[3],
              question: 'Who should work it out on the remix next?',
              duration: 7,
              points: 8,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Trisha/Ethan',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Enya/Drew',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId[2],
              question: 'Which has had the greatest cultural impact?',
              duration: 6,
              points: 7,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Brat summer',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'The Industrial Revolution',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId[1],
              question: 'Who is your favourite artist\'s favourite artist?',
              duration: 5,
              points: 6,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Chappell Roan',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Sabrina Carpenter',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            }
          ],
          duration: 22
        },
        statusCode: 200
      });
    });

    test('Side effect: adminQuizInfo displays correct timeLastEdited', () => {
      const time = Math.floor(Date.now() / 1000);
      const moveBody = { token: token, newPosition: 1 };
      let res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[3]}/move`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

      res = requestGet({ token: token }, `/v1/admin/quiz/${quizId}`);
      expect(res.retval.timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(res.retval.timeLastEdited).toBeLessThanOrEqual(time + 1);
    });
  });

  describe('Testing questionId and newPosition errors (status code 400)', () => {
    test('Question Id does not refer to a valid question within this quiz (invalid Id)', () => {
      const moveBody = { token: token, newPosition: 1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[0] + 1}/move`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Question Id does not refer to a valid question within this quiz (no questions created)', () => {
      // create a new quiz
      quizBody = { token: token, name: 'New Valid Quiz Name', description: 'A new valid quiz description' };
      const quizRes = requestPost(quizBody, '/v1/admin/quiz');
      quizId = quizRes.retval.quizId;

      const moveBody = { token: token, newPosition: 0 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${1234567890}/move`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('NewPosition is less than 0', () => {
      const moveBody = { token: token, newPosition: -1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[0]}/move`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('NewPosition is greater than n-1 where n is the number of questions', () => {
      const moveBody = { token: token, newPosition: 1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[0]}/move`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('NewPosition is the position of the current question', () => {
      const moveBody = { token: token, newPosition: 0 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[0]}/move`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing token error (status code 401)', () => {
    test('Token is empty (no users registered)', () => {
      requestDelete({}, '/v1/clear');

      const moveBody = { token: token, newPosition: 0 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[0]}/move`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Session ID is invalid', () => {
      // create second question
      const answerBody2 = [{ answer: 'Chappell Roan', correct: true }, { answer: 'Sabrina Carpenter', correct: false }];
      const questionCreateBody2 = { question: 'Who is your favourite artist\'s favourite artist?', duration: 5, points: 6, answers: answerBody2 };
      const newQuestionId = requestPost({ token: token, questionBody: questionCreateBody2 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval.questionId);

      const sessionId = parseInt(token) + 1;
      const moveBody = { token: sessionId.toString, newPosition: 1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[0]}/move`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing quiz ID errors (status code 403)', () => {
    beforeEach(() => {
      // create second question
      const answerBody2 = [{ answer: 'Chappell Roan', correct: true }, { answer: 'Sabrina Carpenter', correct: false }];
      const questionCreateBody2 = { question: 'Who is your favourite artist\'s favourite artist?', duration: 5, points: 6, answers: answerBody2 };
      let newQuestionId = requestPost({ token: token, questionBody: questionCreateBody2 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval.questionId);

      // create third question
      const answerBody3 = [{ answer: 'Brat summer', correct: true }, { answer: 'The Industrial Revolution', correct: false }];
      const questionCreateBody3 = { question: 'Which has had the greatest cultural impact?', duration: 6, points: 7, answers: answerBody3 };
      newQuestionId = requestPost({ token: token, questionBody: questionCreateBody3 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval.questionId);

      // create fourth question
      const answerBody4 = [{ answer: 'Trisha/Ethan', correct: true }, { answer: 'Enya/Drew', correct: false }];
      const questionCreateBody4 = { question: 'Who should work it out on the remix next?', duration: 7, points: 8, answers: answerBody4 };
      newQuestionId = requestPost({ token: token, questionBody: questionCreateBody4 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval.questionId);
    });

    test('User is not an owner of this quiz', () => {
      // register another user
      userBody = { email: 'valid1@gmail.com', password: 'ValidPass123', nameFirst: 'Jane', nameLast: 'Doe' };
      const registerUser2 = requestPost(userBody, '/v1/admin/auth/register');
      const token2 = registerUser2.retval.token;

      const moveBody = { token: token2, newPosition: 1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[3]}/move`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });

    test('Quiz does not exist', () => {
      const moveBody = { token: token, newPosition: 1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId + 1}/question/${questionId[3]}/move`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });
});

////////////////////////////////////////////////////////////////////////////

describe('/v2/admin/quiz/{quizid}/question/{questionid}/move', () => {
  let quizId: number;
  let token: string;
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { name: string, description: string };
  let questionId: number[] = [];

  beforeEach(() => {
    questionId = [];
    // register a user to create a quiz
    userBody = { email: 'valid@gmail.com', password: 'ValidPass123', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerUser = requestPost(userBody, '/v1/admin/auth/register');
    token = registerUser.retval.token;

    // create the quiz
    quizBody = { name: 'Valid Quiz Name', description: 'A valid quiz description' };
    const res = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = res.retval.quizId;

    // create first question
    const answerBody = [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince William', correct: false }];
    const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answerBody };
    const newQuestionId = requestPost({ questionBody: questionCreateBody }, `/v2/admin/quiz/${quizId}/question`, { token });
    questionId.push(newQuestionId.retval.questionId);
  });

  describe('Testing successful cases (status code 200)', () => {
    beforeEach(() => {
      // create second question
      const answerBody2 = [{ answer: 'Chappell Roan', correct: true }, { answer: 'Sabrina Carpenter', correct: false }];
      const questionCreateBody2 = { question: 'Who is your favourite artist\'s favourite artist?', duration: 5, points: 6, answers: answerBody2 };
      let newQuestionId = requestPost({ questionBody: questionCreateBody2 }, `/v2/admin/quiz/${quizId}/question`, { token });
      questionId.push(newQuestionId.retval.questionId);

      // create third question
      const answerBody3 = [{ answer: 'Brat summer', correct: true }, { answer: 'The Industrial Revolution', correct: false }];
      const questionCreateBody3 = { question: 'Which has had the greatest cultural impact?', duration: 6, points: 7, answers: answerBody3 };
      newQuestionId = requestPost({ questionBody: questionCreateBody3 }, `/v2/admin/quiz/${quizId}/question`, { token });
      questionId.push(newQuestionId.retval.questionId);

      // create fourth question
      const answerBody4 = [{ answer: 'Trisha/Ethan', correct: true }, { answer: 'Enya/Drew', correct: false }];
      const questionCreateBody4 = { question: 'Who should work it out on the remix next?', duration: 7, points: 8, answers: answerBody4 };
      newQuestionId = requestPost({ questionBody: questionCreateBody4 }, `/v2/admin/quiz/${quizId}/question`, { token });
      questionId.push(newQuestionId.retval.questionId);
    });

    test('Has correct return type', () => {
      // swap second and fourth question
      const res = requestPut({ newPosition: 1 }, `/v2/admin/quiz/${quizId}/question/${questionId[3]}/move`, { token });

      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect: adminQuizinfo displays successful swap of second with fourth question', () => {
      requestPut({ newPosition: 1 }, `/v2/admin/quiz/${quizId}/question/${questionId[3]}/move`, { token });

      expect(requestGet({}, `/v2/admin/quiz/${quizId}`, { token })).toStrictEqual({
        retval: {
          quizId: quizId,
          name: quizBody.name,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: quizBody.description,
          numQuestions: 4,
          questions: [
            {
              questionId: questionId[0],
              question: 'Who is the Monarch of England?',
              duration: 4,
              points: 5,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Prince Charles',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Prince William',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId[3],
              question: 'Who should work it out on the remix next?',
              duration: 7,
              points: 8,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Trisha/Ethan',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Enya/Drew',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId[2],
              question: 'Which has had the greatest cultural impact?',
              duration: 6,
              points: 7,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Brat summer',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'The Industrial Revolution',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId[1],
              question: 'Who is your favourite artist\'s favourite artist?',
              duration: 5,
              points: 6,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Chappell Roan',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Sabrina Carpenter',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            }
          ],
          duration: 22
        },
        statusCode: 200
      });
    });

    test('Side effect: adminQuizinfo displays successful swap of fourth with second question', () => {
      requestPut({ newPosition: 3 }, `/v2/admin/quiz/${quizId}/question/${questionId[1]}/move`, { token });

      expect(requestGet({}, `/v2/admin/quiz/${quizId}`, { token })).toStrictEqual({
        retval: {
          quizId: quizId,
          name: quizBody.name,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: quizBody.description,
          numQuestions: 4,
          questions: [
            {
              questionId: questionId[0],
              question: 'Who is the Monarch of England?',
              duration: 4,
              points: 5,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Prince Charles',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Prince William',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId[3],
              question: 'Who should work it out on the remix next?',
              duration: 7,
              points: 8,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Trisha/Ethan',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Enya/Drew',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId[2],
              question: 'Which has had the greatest cultural impact?',
              duration: 6,
              points: 7,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Brat summer',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'The Industrial Revolution',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId[1],
              question: 'Who is your favourite artist\'s favourite artist?',
              duration: 5,
              points: 6,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Chappell Roan',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Sabrina Carpenter',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            }
          ],
          duration: 22
        },
        statusCode: 200
      });
    });

    test('Side effect: adminQuizInfo displays correct timeLastEdited', () => {
      const time = Math.floor(Date.now() / 1000);
      let res = requestPut({ newPosition: 1 }, `/v2/admin/quiz/${quizId}/question/${questionId[3]}/move`, { token });
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

      res = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
      expect(res.retval.timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(res.retval.timeLastEdited).toBeLessThanOrEqual(time + 1);
    });
  });

  describe('Testing questionId and newPosition errors (status code 400)', () => {
    test('Question Id does not refer to a valid question within this quiz (invalid Id)', () => {
      const res = requestPut({ newPosition: 1 }, `/v2/admin/quiz/${quizId}/question/${questionId[0] + 1}/move`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Question Id does not refer to a valid question within this quiz (no questions created)', () => {
      // create a new quiz
      quizBody = { name: 'New Valid Quiz Name', description: 'A new valid quiz description' };
      const quizRes = requestPost(quizBody, '/v2/admin/quiz', { token });
      quizId = quizRes.retval.quizId;

      const res = requestPut({ newPosition: 0 }, `/v2/admin/quiz/${quizId}/question/${1234567890}/move`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('NewPosition is less than 0', () => {
      const res = requestPut({ newPosition: -1 }, `/v2/admin/quiz/${quizId}/question/${questionId[0]}/move`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('NewPosition is greater than n-1 where n is the number of questions', () => {
      const res = requestPut({ newPosition: 1 }, `/v2/admin/quiz/${quizId}/question/${questionId[0]}/move`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('NewPosition is the position of the current question', () => {
      const res = requestPut({ newPosition: 0 }, `/v2/admin/quiz/${quizId}/question/${questionId[0]}/move`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing token error (status code 401)', () => {
    test('Token is empty (no users registered)', () => {
      requestDelete({}, '/v1/clear');

      const res = requestPut({ newPosition: 0 }, `/v2/admin/quiz/${quizId}/question/${questionId[0]}/move`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Session ID is invalid', () => {
      // create second question
      const answerBody2 = [{ answer: 'Chappell Roan', correct: true }, { answer: 'Sabrina Carpenter', correct: false }];
      const questionCreateBody2 = { question: 'Who is your favourite artist\'s favourite artist?', duration: 5, points: 6, answers: answerBody2 };
      const newQuestionId = requestPost({ questionBody: questionCreateBody2 }, `/v2/admin/quiz/${quizId}/question`, { token });
      questionId.push(newQuestionId.retval.questionId);

      const sessionId = (parseInt(token) + 1).toString();
      const res = requestPut({ newPosition: 1 }, `/v2/admin/quiz/${quizId}/question/${questionId[0]}/move`, { token: sessionId });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing quiz ID errors (status code 403)', () => {
    beforeEach(() => {
      // create second question
      const answerBody2 = [{ answer: 'Chappell Roan', correct: true }, { answer: 'Sabrina Carpenter', correct: false }];
      const questionCreateBody2 = { question: 'Who is your favourite artist\'s favourite artist?', duration: 5, points: 6, answers: answerBody2 };
      let newQuestionId = requestPost({ questionBody: questionCreateBody2 }, `/v2/admin/quiz/${quizId}/question`, { token });
      questionId.push(newQuestionId.retval.questionId);

      // create third question
      const answerBody3 = [{ answer: 'Brat summer', correct: true }, { answer: 'The Industrial Revolution', correct: false }];
      const questionCreateBody3 = { question: 'Which has had the greatest cultural impact?', duration: 6, points: 7, answers: answerBody3 };
      newQuestionId = requestPost({ questionBody: questionCreateBody3 }, `/v2/admin/quiz/${quizId}/question`, { token });
      questionId.push(newQuestionId.retval.questionId);

      // create fourth question
      const answerBody4 = [{ answer: 'Trisha/Ethan', correct: true }, { answer: 'Enya/Drew', correct: false }];
      const questionCreateBody4 = { question: 'Who should work it out on the remix next?', duration: 7, points: 8, answers: answerBody4 };
      newQuestionId = requestPost({questionBody: questionCreateBody4 }, `/v2/admin/quiz/${quizId}/question`, { token });
      questionId.push(newQuestionId.retval.questionId);
    });

    test('User is not an owner of this quiz', () => {
      // register another user
      userBody = { email: 'valid1@gmail.com', password: 'ValidPass123', nameFirst: 'Jane', nameLast: 'Doe' };
      const registerUser2 = requestPost(userBody, '/v1/admin/auth/register');
      const token2 = registerUser2.retval.token;

      const res = requestPut({ newPosition: 1 }, `/v2/admin/quiz/${quizId}/question/${questionId[3]}/move`, { token: token2 });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });

    test('Quiz does not exist', () => {
      const res = requestPut({ newPosition: 1 }, `/v2/admin/quiz/${quizId + 1}/question/${questionId[3]}/move`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });
});
