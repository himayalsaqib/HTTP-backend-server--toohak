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

// Given an admin user's authUserId, return details about the user.
// "name" is the first and last name concatenated with a single space 
// between them.

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