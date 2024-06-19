import { setData, getData } from './dataStore';

/////////////////////////////// Global Variables ///////////////////////////////
const MIN_QUIZ_NAME_LEN = 3;
const MAX_QUIZ_NAME_LEN = 30;
const MAX_DESCRIPTION_LEN = 100;

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 * 
 * @param {number} authUserId
 * @returns {array} 
 */
export function adminQuizList(authUserId) {
    return { quizzes: [
        {
          quizId: 1,
          name: 'My Quiz',
        }
      ]
    };
}

/**
 * Given basic details about a new quiz, create one for the logged in user
 * 
 * @param {number} authUserId 
 * @param {string} name
 * @param {string} description 
 * @returns {object} - assigns a quizId | error
 */  
export function adminQuizCreate( authUserId, name, description ) {
    if (authUserIdIsValid(authUserId) === false) {
        return { error: 'AuthUserId is not a valid user.' };
    }
    if (quizNameHasValidChars(name) === false) {
        return { error: 'Name contains invalid characters. \
                Valid characters are alphanumeric and spaces.' 
        };
    }
    if (name.length < MIN_QUIZ_NAME_LEN || name.length > MAX_QUIZ_NAME_LEN) {
        return { error: 'Name is either less than 3 characters long or \
                more than 30 characters long.' 
        };
    }
    if (quizNameInUse(authUserId, name) === true) {
        return { error: 'Name is already used by the current \
                logged in user for another quiz.'
        };
    }
    if (description.length > MAX_DESCRIPTION_LEN) {
        return { error: 'Description is more than 100 characters in length'};
    }

    let data = getData();
    const newQuizId = Math.random();
    while (quizIdInUse(newQuizId) === true) {
        newQuizId = Math.random();
    }

    const newQuiz = {
        authUserId: authUserId,
        quizId: newQuizId,
        name: name,
        timeCreated: Date.now(),
        timeLastEdited: undefined,
        description: description,
    }

    data.quizzes.push(newQuiz);
    setData(data);

    return { quizId: newQuizId };
}

/**
 * Given a particular quiz, permanently remove the quiz
 * 
 * @param {number} authUserId 
 * @param {number} quizId 
 * @returns {object} - an empty object
 */
export function adminQuizRemove ( authUserId, quizId ) {
    return {};
}

/**
 * Update the description of the relevant quiz
 * 
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} description
 * @returns {object} - an empty object
 */
export function adminQuizDescriptionUpdate (authUserId, quizId, description) {
    return {};
}

/**
 * Provide a list of all quizzes that are owned by the 
 * currently logged in user.
 * 
 * @param {number} authUserId
 * @param {number} quizId 
 * @returns {object} - returns quiz information 
 */
export function adminQuizInfo (authUserId, quizId) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
    };
  }

    /**
 * Update the name of the relevant quiz.
 * 
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} name
 * @returns {object} - empty object
 */
export function adminQuizNameUpdate (authUserId, quizId, name) {
    return {};
  }

/////////////////////////////// Helper Functions ///////////////////////////////

/**
 * Function checks if an authUserId is valid i.e. if there is a matching ID in 
 * the users array 
 *
 * @param {number} authUserId
 * @returns {boolean} true if ID is valid, false if not
 */
function authUserIdIsValid(authUserId) {
    let data = getData();

    const user = data.users.find(user => user.authUserId === authUserId);
    if (user === undefined) {
        return false;
    }
    return true;
}

/**
 * Function checks if a quiz name contains any invalid characters. Characters
 * are considered invalid if they are not alphanumeric or spaces e.g. @
 *
 * @param {String} name
 * @returns {boolean} true if name does not contain any invalid characters, 
 *                    false if it does
 */
function quizNameHasValidChars(name) {
    if (/^[A-Za-z0-9 ]*$/.test(name) === false) {
        return false;
    } else {
        return true;
    }
}

/**
 * Function checks if a quiz name has already been used by the current logged
 * in user
 *
 * @param {Number} authUserId
 * @param {String} name
 * @returns {boolean} true if name has been used, false if it has not
 */
function quizNameInUse(authUserId, name) {
    let data = getData();

    for (const quiz of data.quizzes) {
        if (quiz.authUserId === authUserId && quiz.name == name) {
            return true;
        }
    }
    return false;
}

/**
 * Function checks if a quiz ID has already been used by another quiz
 *
 * @param {Number} quizId
 * @returns {boolean} true if quiz ID has been used, false if it has not
 */
function quizIdInUse(quizId) {
    let data = getData();

    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (quiz === undefined) {
        return false;
    }
    return true;
}