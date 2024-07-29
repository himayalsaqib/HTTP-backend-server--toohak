// Contains all routes for toohak server

import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate,
  adminAuthLogout
} from './auth';
import {
  tokenCreate,
  tokenExists,
  trashedQuizBelongsToUser,
  trashedQuizzesBelongToUser,
  quizDoesNotExist,
  findTokenFromSessionId,
  quizRoutesErrorChecking,
  quizzesDoNotExist,
  quizBelongsToUser,
} from './helper-files/serverHelper';
import { clear } from './other';
import {
  adminQuizCreate,
  adminQuizRemove,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizQuestionUpdate,
  adminQuizTrash,
  adminQuizTrashEmpty,
  adminQuizInfo,
  adminQuizRestore,
  adminQuizDescriptionUpdate,
  adminQuizCreateQuestion,
  adminQuizQuestionDelete,
  adminQuizQuestionMove,
  adminQuizQuestionDuplicate,
  adminQuizTransfer,
  adminQuizSessionStart,
  adminQuizSessionStateUpdate,
  adminQuizThumbnail,
  adminQuizGetSessionStatus,
  adminQuizSessionsView,
  adminQuizSessionResultsCSV
} from './quiz';
import { playerJoin, playerQuestionResults, playerSendChat, playerViewChat, getPlayerStatus, playerSubmitAnswer, playerQuestionInformation } from './player';
import { load } from './dataStore';
import { quizIsInTrash } from './helper-files/quizHelper';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));
// Serve the CSV directory statically
app.use('/csv', express.static(path.join(__dirname, 'csv')));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400);
  }

  return res.json(result);
});

// ============================== OTHER ROUTES ============================== //

app.delete('/v1/clear', (req: Request, res: Response) => {
  res.json(clear());
});

// ============================== AUTH ROUTES =============================== //

// VERSION 1 //

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;

  try {
    const response = adminAuthRegister(email, password, nameFirst, nameLast);
    const token = tokenCreate(response.authUserId);
    res.json({ token: token.sessionId.toString() });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const response = adminAuthLogin(email, password);
    const token = tokenCreate(response.authUserId);
    res.json({ token: token.sessionId.toString() });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.token as string);

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  const response = adminUserDetails(userToken.authUserId);
  res.json(response);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const sessionId = parseInt(token);

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  try {
    const response = adminUserDetailsUpdate(userToken.authUserId, email, nameFirst, nameLast);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const sessionId = parseInt(token);

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);
  try {
    const response = adminUserPasswordUpdate(userToken.authUserId, oldPassword, newPassword);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const sessionId = parseInt(token);

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  const response = adminAuthLogout(userToken);
  res.json(response);
});

// VERSION 2 //

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const sessionId = parseInt(req.header('token'));

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  const response = adminUserDetails(userToken.authUserId);
  res.json(response);
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const { email, nameFirst, nameLast } = req.body;
  const sessionId = parseInt(req.header('token'));

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  try {
    const response = adminUserDetailsUpdate(userToken.authUserId, email, nameFirst, nameLast);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const sessionId = parseInt(req.header('token'));
  const { oldPassword, newPassword } = req.body;

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);
  try {
    const response = adminUserPasswordUpdate(userToken.authUserId, oldPassword, newPassword);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const sessionId = parseInt(req.header('token'));

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  const response = adminAuthLogout(userToken);
  res.json(response);
});

// ============================== QUIZ ROUTES =============================== //

// VERSION 1 //

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const sessionId = parseInt(token);

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  try {
    const response = adminQuizCreate(userToken.authUserId, name, description);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const sessionId = parseInt(req.body.token);
  const newPosition = req.body.newPosition;

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizQuestionMove(questionId, newPosition, quizId);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.query.token as string);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  const response = adminQuizRemove(quizId);
  res.json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.token as string);

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  const response = adminQuizList(userToken.authUserId);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const { token, name } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(token);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  const userToken = errorCheckResponse.userToken;

  try {
    const response = adminQuizNameUpdate(userToken.authUserId, quizId, name);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.token as string);

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);
  const response = adminQuizTrash(userToken.authUserId);
  res.json(response);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.token as string);
  const quizIds = JSON.parse(req.query.quizIds as string);

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  try {
    quizzesDoNotExist(quizIds);
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }

  try {
    trashedQuizzesBelongToUser(userToken.authUserId, quizIds);
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }

  try {
    const response = adminQuizTrashEmpty(quizIds);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { token, description } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(token);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizDescriptionUpdate(quizId, description);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(token);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    quizDoesNotExist(quizId);
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }

  try {
    const response = adminQuizCreateQuestion(quizId, questionBody);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const sessionId = parseInt(req.body.token);
  const quizId = parseInt(req.params.quizid as string);

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  try {
    quizDoesNotExist(quizId);
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }

  try {
    trashedQuizBelongsToUser(userToken.authUserId, quizId);
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }

  try {
    const response = adminQuizRestore(userToken.authUserId, quizId);
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.token as string);
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizQuestionDelete(quizId, questionId);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.token as string);
  const quizId = parseInt(req.params.quizid as string);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  const response = adminQuizInfo(quizId);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const sessionId = parseInt(token);
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizQuestionUpdate(quizId, questionId, questionBody);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const { token, userEmail } = req.body;
  const sessionId = parseInt(token);
  const quizId = parseInt(req.params.quizid as string);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  const userToken = errorCheckResponse.userToken;

  try {
    const response = adminQuizTransfer(quizId, userToken.authUserId, userEmail);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const { token } = req.body;
  const sessionId = parseInt(token);
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizQuestionDuplicate(quizId, questionId);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.header('token'));
  const autoStartNum = req.body.autoStartNum;

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  try {
    quizDoesNotExist(quizId);
    if (!quizIsInTrash(quizId)) {
      quizBelongsToUser(userToken.authUserId, quizId);
    } else {
      trashedQuizBelongsToUser(userToken.authUserId, quizId);
    }
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }

  try {
    const response = adminQuizSessionStart(quizId, autoStartNum);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const quizSessionId = parseInt(req.params.sessionid as string);
  const action = req.body;
  const sessionId = parseInt(req.header('token'));

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizSessionStateUpdate(quizId, quizSessionId, action.action);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const quizSessionId = parseInt(req.params.sessionid as string);
  const sessionId = parseInt(req.header('token'));

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizGetSessionStatus(quizId, quizSessionId);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.header('token'));
  const imgUrl = req.body.imgUrl;

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizThumbnail(quizId, imgUrl);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.header('token'));

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizSessionsView(quizId);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// VERSION 2 //

app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const sessionId = parseInt(req.header('token'));
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizQuestionDuplicate(quizId, questionId);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const { name, description } = req.body;
  const sessionId = parseInt(req.header('token'));

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response;
  try {
    response = adminQuizCreate(userToken.authUserId, name, description);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const { name } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.header('token'));

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  const userToken = errorCheckResponse.userToken;

  try {
    const response = adminQuizNameUpdate(userToken.authUserId, quizId, name);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const sessionId = parseInt(req.header('token'));

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);
  const response = adminQuizTrash(userToken.authUserId);
  res.json(response);
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const sessionId = parseInt(req.header('token'));
  const quizIds = JSON.parse(req.query.quizIds as string);

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  try {
    quizzesDoNotExist(quizIds);
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }

  try {
    trashedQuizzesBelongToUser(userToken.authUserId, quizIds);
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }

  try {
    const response = adminQuizTrashEmpty(quizIds);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { description } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.header('token'));

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizDescriptionUpdate(quizId, description);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const sessionId = parseInt(req.header('token'));

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);
  const response = adminQuizList(userToken.authUserId);
  res.json(response);
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const sessionId = parseInt(req.header('token') as string);
  const quizId = parseInt(req.params.quizid as string);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  const response = adminQuizInfo(quizId);
  res.json(response);
});

app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const sessionId = parseInt(req.header('token'));
  const quizId = parseInt(req.params.quizid as string);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  const response = adminQuizRemove(quizId);
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { questionBody } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.header('token'));

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizCreateQuestion(quizId, questionBody);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const { userEmail } = req.body;
  const sessionId = parseInt(req.header('token') as string);
  const quizId = parseInt(req.params.quizid as string);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  const userToken = errorCheckResponse.userToken;

  try {
    const response = adminQuizTransfer(quizId, userToken.authUserId, userEmail);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const sessionId = parseInt(req.header('token') as string);
  const newPosition = req.body.newPosition;

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizQuestionMove(questionId, newPosition, quizId);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const sessionId = parseInt(req.header('token'));
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizQuestionDelete(quizId, questionId);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results/csv', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const quizSessionId = parseInt(req.params.sessionid as string);
  const sessionId = parseInt(req.header('token'));

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizSessionResultsCSV(quizId, quizSessionId);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const sessionId = parseInt(req.header('token') as string);
  const quizId = parseInt(req.params.quizid as string);

  try {
    tokenExists(sessionId);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const userToken = findTokenFromSessionId(sessionId);

  try {
    quizDoesNotExist(quizId);
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }

  try {
    trashedQuizBelongsToUser(userToken.authUserId, quizId);
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }

  try {
    const response = adminQuizRestore(userToken.authUserId, quizId);
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const { questionBody } = req.body;
  const sessionId = parseInt(req.header('token'));
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);

  const errorCheckResponse = quizRoutesErrorChecking(sessionId, quizId);
  if ('error' in errorCheckResponse) {
    return res.status(errorCheckResponse.code).json({ error: errorCheckResponse.error });
  }

  try {
    const response = adminQuizQuestionUpdate(quizId, questionId, questionBody);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// ============================= PLAYER ROUTES ============================== //

app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;
  try {
    const response = playerJoin(sessionId, name);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const { message } = req.body;
  const playerId = parseInt(req.params.playerid as string);
  try {
    const response = playerSendChat(playerId, message);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid as string);
  const questionPosition = parseInt(req.params.questionposition as string);

  try {
    const response = playerQuestionInformation(playerId, questionPosition);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/v1/player/:playerid/', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid as string);

  try {
    const status = getPlayerStatus(playerId);
    res.json(status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const { answerIds } = req.body;

  try {
    const response = playerSubmitAnswer(playerId, questionPosition, { answerIds });
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid as string);
  try {
    const response = playerViewChat(playerId);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/v1/player/:playerid/question/:questionposition/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid as string);
  const questionPosition = parseInt(req.params.questionposition as string);

  try {
    const response = playerQuestionResults(playerId, questionPosition);
    res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
  load();
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
