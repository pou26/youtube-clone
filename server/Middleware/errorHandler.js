export function errorHandler(err, req, res, next) {
    console.error(`[Error] ${err.message}`);

    res.status(err.status || 500).json({
        msg: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.stack : {} // Hide stack trace in production
    });
}
