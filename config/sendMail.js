import nodemailer from "nodemailer";
import { EMAIL_SERVICE, EMAIL_ADDRESS, EMAIL_PASSWORD } from "./env.js";

export const accountEmail = EMAIL_ADDRESS;

const transport = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_ADDRESS,
    pass: EMAIL_PASSWORD,
  },
});

export const newsletterSend = async (
  senderName,
  senderAddress,
  receiverAddress,
  emailPassword,
  emailService,
  subject,
  content
) => {
  if (
    !senderName ||
    !senderAddress ||
    !receiverAddress ||
    !emailPassword ||
    !emailService ||
    !subject ||
    !content
  ) {
    throw new Error("All parameters are required for sending a newsletter");
  }

  const newsletterTransport = nodemailer.createTransport({
    service: emailService,
    auth: {
      user: senderAddress,
      pass: emailPassword,
    },
  });

  if (!newsletterTransport) {
    throw new Error("Failed to create newsletter transport");
  }

  let mailOptions;

  if (!senderName) {
    mailOptions = {
      from: senderAddress,
      to: receiverAddress,
      subject: subject,
      text: content,
    };
  } else {
    mailOptions = {
      from: `${senderName} <${senderAddress}>`,
      to: receiverAddress,
      subject: subject,
      html: content,
    };
  }

  return await newsletterTransport.sendMail(mailOptions);
};

export { transport };
export default transport;
