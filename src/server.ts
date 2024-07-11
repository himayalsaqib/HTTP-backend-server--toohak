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
import { quizBelongsToUser, tokenCreate, tokenExists, trashedQuizBelongsToUser, quizDoesNotExist, findTokenFromSessionId, sessionIdExists } from './helper-files/serverHelper';
import { clear } from './other';
import {
  adminQuizCreate,
  adminQuizRemove,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizTrash,
  adminQuizInfo,
  adminQuizRestore,
  adminQuizDescriptionUpdate,
  adminQuizCreateQuestion,
  adminQuizQuestionDuplicate
} from './quiz';
import { load } from './dataStore';

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

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;

  const response = adminAuthRegister(email, password, nameFirst, nameLast);

  if ('error' in response) {
    return res.status(400).json(response);
  }

  const token = tokenCreate(response.authUserId);
  res.json({ token: token.sessionId.toString() });
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const response = adminAuthLogin(email, password);

  if ('error' in response) {
    return res.status(400).json(response);
  }

  const token = tokenCreate(response.authUserId);
  res.json({ token: token.sessionId.toString() });
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.token as string);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminUserDetails(userToken.authUserId);
  res.json(response);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const sessionId = parseInt(token);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminUserDetailsUpdate(userToken.authUserId, email, nameFirst, nameLast);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const sessionId = parseInt(token);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminUserPasswordUpdate(userToken.authUserId, oldPassword, newPassword);
  console.log('Tokennnnnnnn');
  console.log(userToken);
  console.log('userToken.authUserIdddddddddddd');
  console.log(userToken.authUserId);
  console.log('userToken.sessionnnnIdddddddddddd');
  console.log(userToken.sessionId);
  console.log('RESPONSEEEEE:');
  console.log(response);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const sessionId = parseInt(token);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminAuthLogout(userToken);
  res.json(response);
});

// ============================== QUIZ ROUTES =============================== //

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const sessionId = parseInt(token);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminQuizCreate(userToken.authUserId, name, description);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.query.token as string);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = quizBelongsToUser(userToken.authUserId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }

  response = adminQuizRemove(userToken.authUserId, quizId);
  res.json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.token as string);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminQuizList(userToken.authUserId);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const { token, name } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(token);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }
  response = quizBelongsToUser(userToken.authUserId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }
  response = adminQuizNameUpdate(userToken.authUserId, quizId, name);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.token as string);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminQuizTrash(userToken.authUserId);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { token, description } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(token);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }
  response = quizBelongsToUser(userToken.authUserId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }
  response = adminQuizDescriptionUpdate(userToken.authUserId, quizId, description);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(token);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = quizBelongsToUser(userToken.authUserId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }

  response = quizDoesNotExist(quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }

  response = adminQuizCreateQuestion(userToken.authUserId, quizId, questionBody);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const sessionId = parseInt(req.body.token);
  const quizId = parseInt(req.params.quizid as string);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = trashedQuizBelongsToUser(userToken.authUserId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }

  response = quizDoesNotExist(quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }

  response = adminQuizRestore(userToken.authUserId, quizId);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.token as string);
  const quizId = parseInt(req.params.quizid as string);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }
  response = quizBelongsToUser(userToken.authUserId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }

  response = adminQuizInfo(userToken.authUserId, quizId);
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const { token } = req.body;

  const sessionId = parseInt(token);
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);

  if (sessionIdExists(sessionId) === false) {
    return (res).status(401).json({ error: 'Invalid session ID' });
  }

  const userToken = findTokenFromSessionId(sessionId);

  let response = tokenExists(userToken);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = quizBelongsToUser(userToken.authUserId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }
  console.log('quizidddddddddddd:');
  console.log(quizId);

  response = adminQuizQuestionDuplicate(userToken.authUserId, quizId, questionId);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
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
