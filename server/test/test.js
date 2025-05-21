import transporter from './config/nodemailer.js';

const sendTestEmail = async () => {
    try {
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: "durgeshdeore214@gmail.com", // Replace with a real email
            subject: "Test Email from Node.js",
            text: "This is a test email to check if SMTP works."
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
    } catch (error) {
        console.error("Email send failed:", error);
    }
};

sendTestEmail();