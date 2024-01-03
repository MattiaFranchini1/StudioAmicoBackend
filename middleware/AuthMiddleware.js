// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log(req.user); // Log the user information for debugging (optional)
  
  // Check if the user is authenticated using Passport.js
  if (req.isAuthenticated()) {
      // If authenticated, proceed to the next middleware or route
      return next();
  } else {
      // If not authenticated, return a 401 Unauthorized status
      return res.status(401).json({ error: 'Unauthorized access' });
  }
};

module.exports = isAuthenticated; // Export the middleware for use in other parts of the application
