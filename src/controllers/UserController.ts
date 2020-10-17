import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/User";

class UserController {
  static listAll = async (request: Request, response: Response) => {
    // Get users from database
    const userRepository = getRepository(User);
    const users = await userRepository.find({
      select: ["id", "username", "role"],
    });

    // Send the users object
    response.send({ users });
  };

  static getOneById = async (request: Request, response: Response) => {
    // Get the ID from url
    const id: number = Number(request.params.id);

    // Get the user from database
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOneOrFail(id, {
        select: ["id", "username", "role"], //We don't want to send the password on response
      });

      response.status(200).send({ user });
    } catch (error) {
      response.status(404).send({ error: "User not found" });
    }
  };

  static newUser = async (request: Request, response: Response) => {
    // Get parameters from body
    let { username, password, role } = request.body;
    let user = new User();
    user.username = username;
    user.password = password;
    user.role = role;

    // Validate if the parameters are ok
    const errors = await validate(user);
    if (errors.length > 0) {
      response.status(400).send(errors);
      return;
    }

    // Hash the password, to securely store on Database
    user.hashPassword();

    // Try to save. If fails, the username is already in use
    const userRepository = getRepository(User);
    try {
      await userRepository.save(user);
    } catch (error) {
      response.status(409).send({ error: "username already in use" });
    }

    // If all ok, send 201 response
    response.status(201).send({ message: "User created" });
  };

  static editUser = async (request: Request, response: Response) => {
    // Get the ID from the url
    const id = request.params.id;

    // Get values from the body
    const { username, role } = request.body;

    // Try to find user on database
    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      // If not found, send a 404 response
      response.status(404).send({ error: "User not found" });
      return;
    }

    // Validate the new values on model
    user.username = username;
    user.role = role;
    const errors = await validate(user);
    if (errors.length > 0) {
      response.status(400).send(errors);
      return;
    }

    // Try to safe, if fails, the means username already in use
    try {
      await userRepository.save(user);
    } catch (error) {
      response.status(409).send({ error: "username already in use" });
      return;
    }
    response.status(204).send();
  };

  static deleteUser = async (request: Request, response: Response) => {
    // Get the ID from the url
    const id = request.params.id;

    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      response.status(404).send({ error: "User not found" });
      return;
    }

    response.status(204).send();
  };
}

export default UserController;
