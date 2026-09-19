"use server";

import nodemailer from "nodemailer";

export async function sendContactEmail(formData) {
  const { name, email, phone, subject, message } = formData;

  // Configure your SMTP transporter (Using Gmail as an example)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your sending email
      pass: process.env.EMAIL_PASS, // Your App Password (not standard login password)
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "adarshagarwal354@gmail.com",
    subject: `Portfolio Contact: ${subject}`,
    text: `New message from your portfolio website:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, error: "Failed to send email" };
  }
}
