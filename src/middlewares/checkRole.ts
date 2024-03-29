import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";

import { User } from "../entity/User";

export const checkRole = (roles: Array<string>) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    // Get the user Id from previous middleware
    const id = response.locals.jwtPayload.userId;

    // Get user role from the databse
    const userRepository = getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      response.status(401).send();
    }

    // Check if array of authorized roles includes the user's role
    if (roles.indexOf(user.role) > -1) next();
    else response.status(401).send();
  };
};
