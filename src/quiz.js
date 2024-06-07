/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 * 
 * @param {number} authUserId
 * @returns {array} 
 */
function adminQuizList(authUserId) {
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
 * @returns {object} - assigns a quizId
 */  
function adminQuizCreate( authUserId, name, description ) {
    return {
        quizId: 2
    };
}

/**
 * Given a particular quiz, permanently remove the quiz
 * 
 * @param {number} authUserId 
 * @param {number} quizId 
 * @returns {object} - an empty object
 */
function adminQuizRemove ( authUserId, quizId ) {
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
function adminQuizDescriptionUpdate (authUserId, quizId, description) {
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
function adminQuizInfo (authUserId, quizId) {
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
function adminQuizNameUpdate (authUserId, quizId, name) {
    return {};
  }