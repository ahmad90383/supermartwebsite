const nodeMailer = require("nodemailer");

const verifyMail = async (email, link) => {
  try {
    let transporter = nodeMailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
      },
    });
    try {
      await transporter.sendMail({
        from: process.env.USER,
        to: email,
        subject: "account verification",
        text: "welcome",
        html: `<div> <a href=${link}>click here to activate your account </a> </div>`,
      });
    } catch (error) {
      console.log(error);
    }
    console.log("mail send successful");
  } catch (error) {
    console.log(error);
  }
};

module.exports = verifyMail;
