const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { User, BehaviorLog } = require('../models');
require('dotenv').config();

const router = express.Router();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.use(limiter);

router.post('/send-emails', async (req, res) => {
  const { emails, userEmail, uuid, fingerprint } = req.body;

  try {
    if (!uuid || !fingerprint) {
      return res.status(400).json({ msg: 'UUID and fingerprint are required' });
    }

    console.log('Received request with UUID:', uuid, 'and fingerprint:', fingerprint);

    let user = await User.findOne({ where: { uuid, fingerprint } });

    if (!user) {
      console.log('User not found, creating a new user');
      user = await User.create({ uuid, fingerprint, emailCount: 0, isPaidUser: false });
    }

    if (user.emailCount >= 2 && !user.isPaidUser) {
      console.error('Email limit reached for user:', userEmail);

      // Create a Stripe Checkout Session and return the URL
      const response = await axios.post('http://localhost:5000/api/stripe/create-checkout-session', { uuid, fingerprint }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.data;

      if (result) {
        return res.status(403).json({ msg: 'Email limit reached. Please upgrade to continue.', paymentUrl: result.url });
      } else {
        return; // Error response already sent in catch block
      }
    }

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SERVICE_EMAIL,
        pass: process.env.SERVICE_EMAIL_PASSWORD
      }
    });

    let emailsProcessed = 0;
    let emailNotFound = [];

    for (const email of emails) {
      const { firstName, lastName, linkedInUrl, message } = email;

      // Fetch the email from Apollo API
      const apolloUrl = "https://api.apollo.io/v1/people/match";
      const apolloData = {
        first_name: firstName,
        last_name: lastName,
        linkedin_url: linkedInUrl,
        reveal_personal_emails: true,
      };

      const apolloHeaders = {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.APOLLO_API_KEY
      };

      let recipientEmail;

      try {
        const apolloResponse = await axios.post(apolloUrl, apolloData, { headers: apolloHeaders });
        if (apolloResponse.data && apolloResponse.data.person && apolloResponse.data.person.email) {
          recipientEmail = apolloResponse.data.person.email;
        } else {
          console.error(`Email not found for ${firstName} ${lastName}`);
          emailNotFound.push(`${firstName} ${lastName}`);
          continue;
        }
      } catch (error) {
        console.error(`Error fetching email for ${firstName} ${lastName}:`, error);
        emailNotFound.push(`${firstName} ${lastName}`);
        continue;
      }

      console.log('Full Name:', `${firstName} ${lastName}`);
      console.log('Email:', recipientEmail);

      const mailOptions = {
        from: process.env.SERVICE_EMAIL,
        replyTo: userEmail,
        to: recipientEmail,
        bcc: userEmail,
        subject: `Message from ${userEmail}`,
        text: `${message}\n\n---\nThis email was sent on behalf of ${userEmail}`
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipientEmail}`);
        await BehaviorLog.create({ userId: user.id, action: 'Email sent', details: `Email sent to ${recipientEmail}` });
        emailsProcessed++;
      } catch (error) {
        console.error(`Error sending email to ${recipientEmail}:`, error);
      }
    }

    user.emailCount += emailsProcessed;
    await user.save();

    if (emailNotFound.length > 0) {
      return res.status(404).json({ msg: `Emails not found for: ${emailNotFound.join(', ')}`, processed: emailsProcessed });
    }

    res.status(200).json({ msg: 'Emails processed and sent', processed: emailsProcessed });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ msg: 'Server error while sending emails' });
  }
});

module.exports = router;
