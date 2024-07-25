// Includes data structure for toohak and data functions

import fs from 'fs';
import { QuizAnswerColours } from './quiz';
import { QuizInfo, QuizSessionState } from './quiz';

const path = __dirname + '/toohakData.json';

export interface ErrorObject {
  error: string
}

export type EmptyObject = Record<never, never>;

export interface Users {
  authUserId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  password: string;
  previousPasswords: Array<string>;
  numFailedLogins: number;
  numSuccessfulLogins: number;
}

export interface Quizzes {
  authUserId: number,
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  questions: Question[];
  duration: number;
  thumbnailUrl?: string;
  activeSessions: number[];
  inactiveSessions: number[];
}

export interface Question {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl?: string;
  points: number;
  answers: Answer[];
}

export interface Answer {
  answerId: number;
  answer: string;
  colour: QuizAnswerColours;
  correct: boolean;
}

export interface QuizSessions {
  sessionId: number;
  state: QuizSessionState;
  atQuestion: number;
  players: Player[];
  autoStartNum: number;
  quiz: QuizInfo;
  usersRankedByScore: UsersRanking[];
  questionResults: QuestionResults[];
  messages: Message[];
}

export interface Player {
  playerId: number;
  name: string;
}

export interface UsersRanking {
  playerId: number;
  name: string;
  score: number;
}

export interface QuestionResults {
  questionNumber: number;
  questionId: number;
  playersCorrectList: string[];
  playersAnsweredList: PlayerAnswered[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface PlayerAnswered {
  playerId: number;
  answerTime: number;
  score: number; // 0 if wrong, points if correct
}

export interface Message {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
}

export interface Trash {
  quiz: Quizzes;
}

export interface Tokens {
  sessionId: number;
  authUserId: number;
}

export interface Data {
  users: Users[];
  quizzes: Quizzes[];
  quizSessions: QuizSessions[];
  trash: Trash[];
  tokens: Tokens[];
  players: Player[]
}

let data: Data = {
  users: [],
  quizzes: [],
  quizSessions: [],
  players: [],
  trash: [],
  tokens: []
};

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: Data) {
  data = newData;

  // saving data as JSON in JSON file
  const dataString = JSON.stringify(newData, null, 2);
  fs.writeFileSync(path, dataString, { flag: 'w' });
}

function load() {
  if (fs.existsSync(path)) {
    const dataString = fs.readFileSync(path);
    data = JSON.parse(dataString.toString());
  }
}

export { getData, setData, load };
