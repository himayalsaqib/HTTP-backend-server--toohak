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
import { quizBelongsToUser, tokenCreate, tokenExists } from './helper-files/serverHelper';
import { clear } from './other';
import {
  adminQuizCreate,
  adminQuizRemove,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizTrash,
  adminQuizDescriptionUpdate,
  adminQuizInfo
} from './quiz';

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

  res.json(tokenCreate(response.authUserId));
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const response = adminAuthLogin(email, password);

  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(tokenCreate(response.authUserId));
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.sessionId as string);
  const authUserId = parseInt(req.query.authUserId as string);
  const token = { sessionId: sessionId, authUserId: authUserId };

  let response = tokenExists(token);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminUserDetails(token.authUserId);
  res.json(response);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  console.log(email);

  let response = tokenExists(token);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminUserDetailsUpdate(token.authUserId, email, nameFirst, nameLast);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;

  let response = tokenExists(token);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminUserPasswordUpdate(token.authUserId, oldPassword, newPassword);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.body;

  let response = tokenExists(token);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminAuthLogout(token);
  res.json(response);
});

// ============================== QUIZ ROUTES =============================== //

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;

  let response = tokenExists(token);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminQuizCreate(token.authUserId, name, description);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);

  const sessionId = parseInt(req.query.sessionId as string);
  const authUserId = parseInt(req.query.authUserId as string);
  const token = { sessionId: sessionId, authUserId: authUserId };

  let response = tokenExists(token);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = quizBelongsToUser(token.authUserId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }

  response = adminQuizRemove(token.authUserId, quizId);
  res.json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.sessionId as string);
  const authUserId = parseInt(req.query.authUserId as string);
  const token = { sessionId: sessionId, authUserId: authUserId };

  let response = tokenExists(token);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminQuizList(token.authUserId);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const { token, name } = req.body;
  const quizId = parseInt(req.params.quizid as string);

  let response = tokenExists(token);
  if ('error' in response) {
    return res.status(401).json(response);
  }
  response = quizBelongsToUser(token.authUserId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }
  response = adminQuizNameUpdate(token.authUserId, quizId, name);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.sessionId as string);
  const authUserId = parseInt(req.query.authUserId as string);
  const token = { sessionId: sessionId, authUserId: authUserId };

  let response = tokenExists(token);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  response = adminQuizTrash(token.authUserId);
  if ('error' in response) {
    return res.status(401).json(response);
  }

  res.json(response);
});


app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { token, description } = req.body;
  const quizId = parseInt(req.params.quizid as string);

  let response = tokenExists(token);
  if ('error' in response) {
    return res.status(401).json(response);
  }
  response = quizBelongsToUser(token.authUserId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }
  response = adminQuizDescriptionUpdate(token.authUserId, quizId, description);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const sessionId = parseInt(req.query.sessionId as string);
  const authUserId = parseInt(req.query.authUserId as string);
  const token = { sessionId: sessionId, authUserId: authUserId };
  const quizId = parseInt(req.params.quizid as string);

  let response = tokenExists(token);
  if ('error' in response) {
    return res.status(401).json(response);
  }
  response = quizBelongsToUser(token.authUserId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }

  response = adminQuizInfo(token.authUserId, quizId);
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
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
