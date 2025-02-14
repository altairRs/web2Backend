const path = require("path");

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // If request is from a browser, show the HTML error page
    if (req.accepts("html")) {
        return res.status(err.status || 500).sendFile(path.join(__dirname, "../public/error.html"));
    }

    // For API requests, send JSON response
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Something went wrong! Please try again later."
    });
};

module.exports = errorHandler;
