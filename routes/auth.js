const express = require("express");
const { check, validationResult, body } = require("express-validator");
const router = express.Router();
const helper = require("../config/helpers");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// const Mysqli = require('mysqli')


// LOGIN ROUTE
// router.post('/login', [helper.hasAuthFields, helper.isPasswordAndUserMatch], (req, res) => {
//     let token = jwt.sign({ state: 'true', email: req.userData.email, username: req.userData.username }, helper.secret, {
//         algorithm: 'HS512',
//         expiresIn: '4h'
//     });
//     console.log(req.body, "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
//     res.json({  
//         token: token,
//         auth: true,
//         email: req.userData.email,
//         username: req.userData.username,
//         id: req.userData.id,
//         photoUrl:req.userData.photoUrl,
//         fname:req.userData.fname,
//         lname:req.userData.lname
//     });
// });


// let conn = new Mysqli({
//     host: 'localhost', // IP/domain  
//     post: 3306, //port, default 3306  
//     user: 'root', // username
//     passwd: 'Suru@1432', // password
//     db: 'mega_shop' // the default database name  【optional】
// })

// let db = conn.emit(false, '')

router.post(
  "/login",
  [helper.hasAuthFields, helper.isPasswordAndUserMatch],
  async (req, res) => {
    let token = jwt.sign(
      { state: "true", email: req.body.email, username: req.body.username },
      helper.secret,
      {
        algorithm: "HS512",
        expiresIn: "4h",
      }
    );
    console.log(req.body, "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");


    const user = await db
      .table("users")
      .filter({ $or: [{ email: myEmail }, { username: myEmail }] })
      .get();

      console.log('user', user.id)


    res.json({
      token: token,
      auth: true,
      username: user?.username,
    });
  }
);

// REGISTER ROUTE
router.post(
  "/register",
  [
    check("email")
      .isEmail()
      .not()
      .isEmpty()
      .withMessage("Field can't be empty")
      .normalizeEmail({ all_lowercase: true }),
    check("password")
      .escape()
      .trim()
      .not()
      .isEmpty()
      .withMessage("Field can't be empty")
      .isLength({ min: 6 })
      .withMessage("must be 6 characters long"),
    body("email").custom((value) => {
      return helper.database
        .table("users")
        .filter({
          $or: [{ email: value }, { username: value.split("@")[0] }],
        })
        .get()
        .then((user) => {
          if (user) {
            console.log(user);
            return Promise.reject(
              "Email / Username already exists, choose another one."
            );
          }
        });
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    } else {
      let email = req.body.email;
      let username = email.split("@")[0];
      let password = await bcrypt.hash(req.body.password, 10);
      let fname = req.body.fname;
      let lname = req.body.lname;

      /**
       * ROLE 777 = ADMIN
       * ROLE 555 = CUSTOMER
       **/
      helper.database
        .table("users")
        .insert({
          username: username,
          password: password,
          email: email,
          role: 555,
          lname: lname || null,
          fname: fname || null,
        })
        .then((lastId) => {
          if (lastId > 0) {
            res.status(201).json({ message: "Registration successful." });
          } else {
            res.status(501).json({ message: "Registration failed." });
          }
        })
        .catch((err) => res.status(433).json({ error: err }));
    }
  }
);

module.exports = router;
