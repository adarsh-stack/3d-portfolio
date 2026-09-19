// actions/auth.js
"use server";

import clientPromise from "@/lib/mongodb";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";

const ALLOWED_ADMIN = "adarshagarwal354@gmail.com";
const SENDER_EMAIL = process.env.EMAIL_USER;

export async function sendOtpAction(email) {
  if (email !== ALLOWED_ADMIN) {
    return { success: false, error: "Access Denied: Unauthorized email." };
  }

  try {
    const client = await clientPromise;
    const db = client.db("authDB");
    const otpsCollection = db.collection("otps");

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash OTP & set expiry to 2 minutes from now
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Delete any existing OTPs for this email to prevent spam
    await otpsCollection.deleteMany({ email });

    // Store in Mongo
    await otpsCollection.insertOne({
      email,
      hashedOtp,
      expiresAt,
    });

    // Send via Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SENDER_EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Admin Portal" <${SENDER_EMAIL}>`,
      to: email,
      subject: "Your Admin Login OTP",
      text: `Your OTP for login is: ${otp}. It is valid for 2 minutes.`,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to send OTP." };
  }
}
export async function verifyOtpAction(email, otp) {
  if (email !== ALLOWED_ADMIN) return { success: false, error: "Unauthorized" };

  try {
    console.log(`1. Verifying OTP for: ${email}`);
    const client = await clientPromise;
    const db = client.db('authDB');
    const otpsCollection = db.collection('otps');

    const record = await otpsCollection.findOne({ email });
    console.log(`2. Database record found:`, record ? "Yes" : "No");

    if (!record) {
      return { success: false, error: "No OTP requested or expired." };
    }

    // Check 2-minute validity
    if (new Date() > record.expiresAt) {
      console.log(`3. OTP Expired.`);
      await otpsCollection.deleteOne({ email }); 
      return { success: false, error: "OTP has expired." };
    }

    // Clean the input and Validate
    const cleanOtp = otp.trim();
    const isValid = await bcrypt.compare(cleanOtp, record.hashedOtp);
    console.log(`4. Cryptographic match:`, isValid ? "Success" : "Failed");

    if (!isValid) {
      return { success: false, error: "Invalid OTP." };
    }

    console.log(`5. Setting Cookie...`);
    await otpsCollection.deleteOne({ email });
    
    const cookieStore = await cookies();
cookieStore.set('admin_session', 'authenticated', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24, // 1 day
  path: '/',
});

    console.log(`6. Verification Complete!`);
    return { success: true };
  } catch (error) {
    console.error("VERIFICATION CATCH BLOCK ERROR:", error);
    return { success: false, error: `Server error: ${error.message}` };
  }
}