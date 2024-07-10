// contains the HTTP tests for adminQuizQuestionMove from quiz.ts

import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('/v1/admin/quiz/{quizid}/question/{questionid}/move', () => {
  const error = { error: expect.any(String) };
  let quizId: number;
  let token: string;
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  const questionId: number[] = [];

  beforeEach(() => {
    // register a user to create a quiz
    userBody = { email: 'valid@gmail.com', password: 'ValidPass123', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerUser = requestPost(userBody, '/v1/admin/auth/register');
    token = registerUser.retval.token;

    // create the quiz
    quizBody = { token: token, name: 'Valid Quiz Name', description: 'A valid quiz description' };
    const res = requestPost(quizBody, '/v1/admin/quiz');
    quizId = res.retval.quizId;
  });

  describe('Testing successful cases (status code 200)', () => {
    beforeEach(() => {
      // create first question
      const answerBody = [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince William', correct: false }];
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answerBody };
      let newQuestionId = requestPost({ token: token, questionBody: questionCreateBody }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);

      // create second question
      const answerBody2 = [{ answer: 'Chappell Roan', correct: true }, { answer: 'Sabrina Carpenter', correct: false }];
      const questionCreateBody2 = { question: 'Who is your favourite artist\'s favourite artist?', duration: 5, points: 6, answers: answerBody2 };
      newQuestionId = requestPost({ token: token, questionBody: questionCreateBody2 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);

      // create third question
      const answerBody3 = [{ answer: 'The girl, so confusing version with lorde', correct: true }, { answer: 'The Industrial Revolution', correct: false }];
      const questionCreateBody3 = { question: 'Which has had the greatest cultural impact?', duration: 6, points: 7, answers: answerBody3 };
      newQuestionId = requestPost({ token: token, questionBody: questionCreateBody3 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);

      // create fourth question
      const answerBody4 = [{ answer: 'No', correct: true }, { answer: 'Yes', correct: false }];
      const questionCreateBody4 = { question: 'Does anyone actually care about the English monarchy?', duration: 7, points: 8, answers: answerBody4 };
      newQuestionId = requestPost({ token: token, questionBody: questionCreateBody4 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);
    })
    test('Has correct return type', () => {
      // swap second and fourth question
      const moveBody = { token: token, newPosition: 1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[3]}/move`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect: adminQuizinfo displays successful swap of second and fourth question', () => {
      const moveBody = { token: token, newPosition: 1 };
      expect(requestGet(moveBody, `/v1/admin/quiz/${quizId}`)).toStrictEqual({
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
              question: 'Does anyone actually care about the English monarchy?',
              duration: 7,
              points: 8,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'No',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Yes',
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
                  answer: 'The girl, so confusing version with lorde',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Rhe Industrial Revolution',
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
                  answer: 'Chappel Roan',
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
          duration: expect.any(Number)
        },
        statusCode: 200
      });

      test('Side effect: adminQuizInfo displays correct timeLastEdited', () => {
        const time = Math.floor(Date.now() / 1000);
        const moveBody = { token: token, newPosition: 1 };
        let res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[3]}/move`);
        expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

        res = requestGet({ token: token }, `/v1/admin/quiz/${quizId}`);
        expect(res.retval.timeLastEdited).toBeGreaterThanOrEqual(time);
        expect(res.retval.timeLastEdited).toBeLessThanOrEqual(time + 1);
      })
    });
  });

  describe('Testing questionId and newPosition errors (status code 400)', () => {
    test('Question Id does not refer to a valid question within this quiz (invalid Id)', () => {
      // create first question
      const answerBody = [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince William', correct: false }];
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answerBody };
      let newQuestionId = requestPost({ token: token, questionBody: questionCreateBody }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);

      const moveBody = { token: token, newPosition: 1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[0] + 1}/move`);
      expect(res).toStrictEqual({ retval: error, statusCode: 400 });
    })

    test('Question Id does not refer to a valid question within this quiz (no questions created)', () => {
      const moveBody = { token: token, newPosition: 0 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${1234567890}/move`);
      expect(res).toStrictEqual({ retval: error, statusCode: 400 });
    })

    test('NewPosition is less than 0', () => {
      // create first question
      const answerBody = [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince William', correct: false }];
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answerBody };
      let newQuestionId = requestPost({ token: token, questionBody: questionCreateBody }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);

      const moveBody = { token: token, newPosition: -1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[0]}/move`);
      expect(res).toStrictEqual({ retval: error, statusCode: 400 });
    })

    test('NewPosition is greater than n-1 where n is the number of questions', () => {
      // create first question
      const answerBody = [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince William', correct: false }];
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answerBody };
      let newQuestionId = requestPost({ token: token, questionBody: questionCreateBody }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);

      const moveBody = { token: token, newPosition: 1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[0]}/move`);
      expect(res).toStrictEqual({ retval: error, statusCode: 400 });
    })

    test('NewPosition is the position of the current question', () => {
      // create first question
      const answerBody = [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince William', correct: false }];
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answerBody };
      let newQuestionId = requestPost({ token: token, questionBody: questionCreateBody }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);

      const moveBody = { token: token, newPosition: 0 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[0]}/move`);
      expect(res).toStrictEqual({ retval: error, statusCode: 400 });
    })
  })

  describe('Testing token error (status code 401', () => {
    test('Token is empty (no users registered', () => {
      requestDelete({}, '/v1/clear');
      
      const moveBody = { token: token, newPosition: 0 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${1234567890}/question/${questionId[1234567890]}/move`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    })

    test('Session ID is invalid', () => {
      // create first question
      const answerBody = [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince William', correct: false }];
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answerBody };
      let newQuestionId = requestPost({ token: token, questionBody: questionCreateBody }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);

      // create second question
      const answerBody2 = [{ answer: 'Chappell Roan', correct: true }, { answer: 'Sabrina Carpenter', correct: false }];
      const questionCreateBody2 = { question: 'Who is your favourite artist\'s favourite artist?', duration: 5, points: 6, answers: answerBody2 };
      newQuestionId = requestPost({ token: token, questionBody: questionCreateBody2 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);

      const sessionId = parseInt(token) + 1;
      const moveBody = { token: sessionId.toString, newPosition: 1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[0]}/move`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    })
  })

  describe('Testing quiz ID errors (status code 403)', () => {
    beforeEach(() => {
      // create first question
      const answerBody = [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince William', correct: false }];
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answerBody };
      let newQuestionId = requestPost({ token: token, questionBody: questionCreateBody }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);

      // create second question
      const answerBody2 = [{ answer: 'Chappell Roan', correct: true }, { answer: 'Sabrina Carpenter', correct: false }];
      const questionCreateBody2 = { question: 'Who is your favourite artist\'s favourite artist?', duration: 5, points: 6, answers: answerBody2 };
      newQuestionId = requestPost({ token: token, questionBody: questionCreateBody2 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);

      // create third question
      const answerBody3 = [{ answer: 'The girl, so confusing version with lorde', correct: true }, { answer: 'The Industrial Revolution', correct: false }];
      const questionCreateBody3 = { question: 'Which has had the greatest cultural impact?', duration: 6, points: 7, answers: answerBody3 };
      newQuestionId = requestPost({ token: token, questionBody: questionCreateBody3 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);

      // create fourth question
      const answerBody4 = [{ answer: 'No', correct: true }, { answer: 'Yes', correct: false }];
      const questionCreateBody4 = { question: 'Does anyone actually care about the English monarchy?', duration: 7, points: 8, answers: answerBody4 };
      newQuestionId = requestPost({ token: token, questionBody: questionCreateBody4 }, `/v1/admin/quiz/${quizId}/question`);
      questionId.push(newQuestionId.retval);
    })

    test('User is not an owner of this quiz', () => {
      // register another user
      userBody = { email: 'valid@gmail.com', password: 'ValidPass123', nameFirst: 'Jane', nameLast: 'Doe' };
      const registerUser2 = requestPost(userBody, '/v1/admin/auth/register');
      const token2 = registerUser2.retval.token;

      const moveBody = { token: token2, newPosition: 1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId}/question/${questionId[3]}/move`);
      expect(res).toStrictEqual({ retval: error, statusCode: 403 });
    })

    test('Quiz does not exist', () => {
      const moveBody = { token: token, newPosition: 1 };
      const res = requestPut(moveBody, `/v1/admin/quiz/${quizId + 1}/question/${questionId[3]}/move`);
      expect(res).toStrictEqual({ retval: error, statusCode: 403 });
    })
  })
});
