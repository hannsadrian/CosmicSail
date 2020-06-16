/**
 * short utility method for sending errors with express
 *
 * @param error - Error message
 * @param res - Express response
 */
export function sendError(error: string, res) {
    res.statusCode = 400;
    res.json({error: true, message: error});
}