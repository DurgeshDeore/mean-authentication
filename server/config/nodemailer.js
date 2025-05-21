import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, 
    auth: {
        user: '8b82bd002@smtp-brevo.com',
        pass: 'UXRDygIz36VjKrb2'
    },
    tls: {
        ciphers: 'SSLv3',
        minVersion: 'TLSv1.2'
    },
    logger: true,
    debug: true
});

transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP Connection Error:", error);
    } else {
        console.log("SMTP Server is ready to send emails");
    }
});

export default transporter;