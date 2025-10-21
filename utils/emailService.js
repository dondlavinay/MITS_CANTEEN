const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Add timeout settings
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,
    socketTimeout: 10000
});

const sendEmail = async (to, subject, text) => {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                text
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return true;
        } catch (error) {
            lastError = error;
            console.log(`Email attempt ${attempt} failed:`, error.message);
            
            if (attempt < maxRetries) {
                // Wait for 2 seconds before retrying
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError.message}`);
};

module.exports = { sendEmail };
