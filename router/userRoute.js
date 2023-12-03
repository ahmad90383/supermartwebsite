const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const generateToken = require("../generateToken");
const VerificationToken = require("../models/verificationToken");
const nodemailer = require("nodemailer");
const ResetOtp = require("../models/resetOtp");
const dotenv = require("dotenv");

dotenv.config();

// for sign up
router.post(
  "/signup",
  [body("email").isEmail().withMessage("Invalid email format")],
  [
    body("firstName")
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
  ],
  async (req, res) => {
    try {
      const { firstName, lastName, email, phone, password, confirmPassword } =
        req.body;

      // Validate the request body against the defined validation rules
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
      }

      // Check if the email already exists
      const userExists = await User.findOne({ email: email });
      if (userExists) {
      }

      // Check if the password and confirm password match
      if (password !== confirmPassword) {
        return res.status(422).json({ error: "Passwords do not match" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user instance
      const newUser = new User({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        confirmPassword: hashedPassword,
      });
      await newUser.save();

      const verificationToken = new VerificationToken({
        userId: newUser._id,
        token: Math.floor(100000 + Math.random() * 900000),
      });

      // Save the user into the database
      await verificationToken.save();

      // sending email to the user
      try {
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD,
          },
        });

        let mailOptions = {
          from: process.env.AUTH_EMAIL,
          to: newUser.email,
          subject: "Email Verification",
          html: `<h1>${verificationToken.token}</h1>`,
        };

        try {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              res.status(201).send({
                success: "Pending",
                message: "verification email has been sent to your account",
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(404).json({ message: "something went wrong" });
            });
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post("/signup/:verificationToken", async (req, res) => {
  try {
    const { verificationToken } = req.body;

    if (!verificationToken) {
      return res.status(400).json({ error: "Verification token is missing" });
    }

    const token = await VerificationToken.findOne({
      token: verificationToken,
    });

    if (!token) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    await User.updateOne({ _id: token.userId }, { $set: { verified: true } });
    await VerificationToken.findByIdAndRemove(token._id);
    res.status(200).json({ message: "Verification successful" });
    //
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// verification page
// router.get("/users/confirm/:verificationToken", async (req, res) => {
//   try {
//     const token = await VerificationToken.findOne({
//       token: req.params.verificationToken,
//     });
//     if (!token) {
//       return res.status(404).send("Token not found");
//     }

//     await User.updateOne({ _id: token.userId }, { $set: { verified: true } });
//     await VerificationToken.findByIdAndRemove(token._id);
//     res.send("Email verified");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// for login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Enter All Info" });
    }

    const user = await User.findOne({ email: email });

    if (user.verified === false) {
      return res.status(422).json({ error: "Invalid Credentials" });
    }

    if (!user) {
      return res.status(422).json({ error: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    // if password or email not matching
    if (!isMatch) {
      return res.status(422).json({ error: "Invalid Credentials" });
    }

    res.json({
      _id: user._id,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log(error);
  }
});

//reset password
router.post("/resetEmailSend", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Enter All Info" });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(422).json({ error: "Email Id does'nt exist" });
    }

    let generatedOtp = Math.floor(Math.random() * 10000 + 1);
    let otpData = new ResetOtp({
      email: email,
      code: generatedOtp,
      expireIn: new Date().getTime() + 300 * 1000,
    });

    await otpData.save();

    // node mailer
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ahmadshahzad.9038@gmail.com",
          pass: "mmov qdsb xwmz soqs",
        },
      });
      let mailOptions = {
        from: "ahmadshahzad.9038@gmail.com",
        to: "ahmadshahzad.9038@gmail.com",
        subject: "sending email with react and node.js",
        text: "working or not",
      };

      try {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error", error);
          } else {
            console.log("email send", info.response);
          }
        });
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }

    res.status(200).json({ message: "Email Sent" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
