// Register a user with an email, password, and names, then returns their authUserId value
// Parameters: email, password, nameFirst, nameLast
// Returns authUserId object 

function adminAuthRegister (email, password, nameFirst, nameLast) {
    return {
        authUserId: 1,
    };
}

/**
 * Given a registered user's email and password returns their authUserId value
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {object} authUserId
 */

function adminAuthLogin (email, password) {
    return {
        authUserId: 1,
    };
}