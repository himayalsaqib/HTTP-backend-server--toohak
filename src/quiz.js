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
    }
}

// Given basic details about a new quiz, create one for the logged in user
// Parameters: authUserId (integer), name (string), and description (string)
// Returns: an object
function adminQuizCreate( authUserId, name, description ) {
    return {
        quizId: 2
    };
}

// Given a particular quiz, permanently remove the quiz
// Parameters: authUserId (integer), quizId (integer)
// Returns: an empty object
function adminQuizRemove ( authUserId, quizId ) {
    return {};
}