// contains the tests for all functions in quiz.js

import {
    adminQuizList,
    adminQuizCreate,
    adminQuizRemove,
    adminQuizDescriptionUpdate,
    adminQuizInfo,
    adminQuizNameUpdate
} from './quiz';

beforeEach(() => {
    clear();
});