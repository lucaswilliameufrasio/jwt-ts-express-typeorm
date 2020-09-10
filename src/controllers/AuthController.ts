import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/User";
import envConfig from "../config/env";

class AuthController {
  static login = async (request: Request, response: Response) => {
    // Check if username and password are set
    let { username, password } = request.body;
    if (!(username && password)) {
      response.status(400).send();
    }

    // Get user from database
    const userRepository = getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch (error) {
      response.status(401).send();
    }

    // Check if encrypted password match
    if (!user.checkIfUnecryptedPasswordIsValid(password)) {
      response.status(401).send();
      return;
    }

    // Sing JWT, valid for 1 hour
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      envConfig.jwtSecret,
      { expiresIn: "1h" }
    );

    // Send the jwt in the response
    response.send({token});
  };

  static changePassword = async (request: Request, response: Response) => {
    // Get ID from JWT
    const id = response.locals.jwtPayload.userId;

    // Get parameters from the body
    const { oldPassword, newPassword } = request.body;
    if (!(oldPassword && newPassword)) {
      response.status(401).send();
    }

    // Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      response.status(401).send();
    }

    // Check if old password matchs
    if (!user.checkIfUnecryptedPasswordIsValid(oldPassword)) {
      response.status(401).send();
      return;
    }

    // Validate the model (password length)
    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      response.status(400).send(errors);
      return;
    }

    // Hash the new password and save
    user.hashPassword();
    userRepository.save(user);

    response.send(204).send();
  };
}

export default AuthController;
