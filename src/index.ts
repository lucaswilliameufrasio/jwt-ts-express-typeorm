import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import routes from "./routes";

// CreateConnection is async so the idea here is
// to wait till connection with database stablish
// then express server is able to start or throw
// an error and don't start express.
createConnection()
  .then(async (connection) => {
    // Express application instance
    const app = express();

    // Call middleware
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());

    // Set all routes from routes folder
    app.use("/", routes);

    app.listen(7777, () => {
      console.log("Server started on port 7777!");
    });
  })
  .catch((error) => console.log(error));
