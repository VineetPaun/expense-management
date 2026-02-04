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

    const resolveMessage = (body) => {
      if (!body) return null;
      if (typeof body === "string") return body;
      if (Buffer.isBuffer(body)) return body.toString("utf8");
      if (typeof body === "object") {
        if (body.message) return body.message;
        if (body.error) return body.error;
        if (Array.isArray(body.errors) && body.errors.length > 0) {
          const firstError = body.errors[0];
          return firstError?.message || firstError;
        }
      }
      return null;
    };

    const message =
      resolveMessage(responseBody) ||
      res.statusMessage ||
      `Request failed (HTTP ${res.statusCode})`;

    const responseError = new Error(message);
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
