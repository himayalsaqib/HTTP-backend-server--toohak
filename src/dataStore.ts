import fs from 'fs';

const path = __dirname + '/toohakData.json';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY

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
  authUserId: number;
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  questions?: Question[];
  duration?: number;
}

export interface Question {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
}

export interface Answer {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
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
  trash: Trash[];
  tokens: Tokens[];
}

let data: Data = {
  users: [],
  quizzes: [],
  trash: [],
  tokens: []
};

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

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
