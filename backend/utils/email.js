const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    return transporter;
  }

  transporter = nodemailer.createTransport({ jsonTransport: true });
  return transporter;
};

exports.sendOtpEmail = async (to, otp) => {
  const mailTransporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@complaints.local';
  const otpExpiryMinutes = Number(process.env.OTP_EXPIRE_MINUTES || 5);

  const result = await mailTransporter.sendMail({
    from,
    to,
    subject: 'Your registration OTP code',
    text: `Your OTP is ${otp}. It expires in ${otpExpiryMinutes} minutes.`,
    html: `<p>Your OTP is <strong>${otp}</strong>.</p><p>It expires in ${otpExpiryMinutes} minutes.</p>`,
  });

  if (mailTransporter.options.jsonTransport) {
    console.log(`OTP for ${to}: ${otp}`);
    console.log(result.message.toString());
  }
};
