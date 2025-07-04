const nodemailer = require("nodemailer")

require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendEmail=async(receiptent,verification_code)=>{
try{
      // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"GharBata 👻" <${process.env.EMAIL_USER}>`, 
    to: receiptent,
    subject: "Verification OTP",
    text: "Verification OTP",
    html: verification_code,
  })

  console.log("Message sent: %s", info.messageId)
}
catch(error){
    console.log(error)
}
}


