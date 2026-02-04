/**
 * @fileoverview Response Error Logger Middleware
 * @description Captures non-exception error responses for persistence.
 */

import { logError } from "./error.logger.middleware.js";

const responseErrorLogger = () => (req, res, next) => {
  let responseBody;

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  res.send = (body) => {
    responseBody = body;
    return originalSend(body);
  };

  res.on("finish", () => {
    if (res.statusCode < 400 || res.locals.errorLogged) {
      return;
    }

    const responseError = new Error(
      responseBody?.message || "Request failed",
    );
    responseError.name = "ResponseError";
    responseError.statusCode = res.statusCode;

    logError(responseError, req, {
      extra: {
        responseBody,
      },
    });
  });

  next();
};

export { responseErrorLogger };
