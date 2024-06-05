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