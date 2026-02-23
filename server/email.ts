import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function sendOtpEmail(to: string, otp: string) {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.warn("SMTP_EMAIL or SMTP_PASSWORD not set. Logging OTP instead.");
        console.log(`[OTP] Email to ${to}: ${otp}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"TrustLayer" <${process.env.SMTP_EMAIL}>`,
            to,
            subject: "Your Login Code",
            text: `Your login code is ${otp}. It will expire in 10 minutes.`,
            html: `<b>Your login code is ${otp}.</b><br>It will expire in 10 minutes.`,
        });
        console.log("Message sent: %s", info.messageId);
    } catch (err) {
        console.error("Error sending email", err);
    }
}
