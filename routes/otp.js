const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('OTP Request received:', { email, otp });
    console.log('Environment check:', {
      EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Missing'
    });
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    const mailOptions = {
      from: `"MITS Canteen" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'MITS Canteen - OTP Verification',
      html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Valid for 10 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to:', email);
    
    res.json({ success: true, message: 'OTP sent successfully' });
    
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const testMail = {
      from: `"MITS Canteen" <${process.env.EMAIL_USER}>`,
      to: '23691a28i8@mits.ac.in',
      subject: 'Test Email from MITS Canteen',
      text: 'This is a test email to verify SMTP configuration.'
    };
    
    const result = await transporter.sendMail(testMail);
    console.log('Test email sent:', result);
    
    res.json({ success: true, message: 'Test email sent', messageId: result.messageId });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;