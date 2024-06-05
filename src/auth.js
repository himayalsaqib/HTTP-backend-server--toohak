// Register a user with an email, password, and names, then returns their authUserId value
// Parameters: email, password, nameFirst, nameLast
// Returns authUserId object 

function adminAuthRegister (email, password, nameFirst, nameLast) {
    return {
        authUserId: 1,
    };
}

// Given a registered user's email and password returns their authUserId value
// Parameters: email, password
// Returns authUserId object

function adminAuthLogin (email, password) {
    return {
        authUserId: 1,
    };
}

/**
 * Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated with a single space 
 * between them.
 * 
 * @param {number} authUserId
 * @returns {object} user 
 */
function adminUserDetails ( authUserId ) {
    return { user:
        {
          userId: 1,
          name: 'Hayden Smith',
          email: 'hayden.smith@unsw.edu.au',
          numSuccessfulLogins: 3,
          numFailedPasswordsSinceLastLogin: 1,
        }
      };
}

/**
 * Given details relating to a password change, update the password 
 * of a logged in user.
 *
 * @param {number} authUserId
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {object} empty
 */
function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
  return {};
}

/**
 * Given an admin user's authUserId and a set of properties, 
 * update the properties of this logged in admin user.
 *
 * @param {number} authUserId
 * @param {string} email
 * @param {string} nameFirst
 * @param {string} nameLast
 * @returns {object} empty
 */
function adminUserDetailsUpdate( authUserId, email, nameFirst, nameLast ) {
  return {};
}

/**
 * Provide a list of all quizzes that are owned by the 
 * currently logged in user.
 * 
 * @param {number} authUserId
 * @param {number} quizId 
 * @returns {{quizId, name, timeCreated, timeLastEdited, description}}
 */
function adminQuizInfo (authUserId, quizId) {
  return {
      quizId: 1,
      name: 'My Quiz',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871,
      description: 'This is my quiz',
  }
}