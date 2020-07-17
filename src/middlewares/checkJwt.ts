import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/env";

export const checkJwt = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // Get the jwt token from the head of the request
  const token = <string>request.headers["auth"];
  let jwtPayload;

  // Try to validate the token and get data
  try {
    jwtPayload = <any>jwt.verify(token, config.jwtSecret);
    response.locals.jwtPayload = jwtPayload;
  } catch (error) {
    // If token is not valid, respond with 401 (unauthorized)
    response.status(401).send();
    return;
  }

  // The token is valid for 1 hour
  // We want to send a new token on every request
  const { userId, username } = jwtPayload;
  const newToken = jwt.sign({ userId, username }, config.jwtSecret, {
    expiresIn: "1h",
  });
  response.setHeader("token", newToken);

  // Call the next function to application flow to another middleware or controller
  next();
};
