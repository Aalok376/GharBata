import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendEmail = async (recipient, subject, htmlContent) => {
  try {

    const info = await transporter.sendMail({
      from: `"GharBata" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: subject || "Verification OTP",
      text: subject || "Verification OTP",
      html: htmlContent
    })

    console.log("Message sent: %s", info.messageId)
  } catch (error) {
    console.log(error)
  }
}



