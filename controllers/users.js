const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const database = require("./../knex/database");

exports.usersController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({
      error: errors.array(),
    });
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // TODO: insert user to database
  database
    .insert({
      email: req.body.username,
      password: hashedPassword,
    })
    .returning("id")
    .into("users")
    .catch((error) => {
      // TODO: error handling
      console.log(error);
      // email already exist
      return res
        .status(409)
        .send({
          details: `Duplicate entry: ${req.body.username} already exist`,
        });
    })
    .then((id) => {
      id = id[0];
      res.status(200).send({ id, username: req.body.username });
    });
};
