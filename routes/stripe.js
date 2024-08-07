const express = require('express');
const stripe = require('../middleware/stripeConfig');
const { User, Token, BehaviorLog, Session, Sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { Op } = Sequelize;

const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
  const { uuid, fingerprint } = req.body;

  if (!uuid || !fingerprint) {
    console.error('UUID or fingerprint is missing');
    return res.status(400).json({ msg: 'UUID and fingerprint are required' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_1Pjgp1HBmEVZKmtqrgKtT7vV',
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'http://localhost:5000/cancel',
      metadata: { uuid, fingerprint },
    });

    await Session.create({ sessionId: session.id, uuid, fingerprint });
    await Token.create({ token: session.id, userId: uuid, used: false, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe Checkout Session:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/success', async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const { uuid, fingerprint } = session.metadata;

      const storedSession = await Session.findOne({ where: { sessionId: session_id } });
      if (!storedSession || storedSession.verified) {
        return res.status(400).json({ msg: 'Invalid or already verified session.' });
      }

      let user = await User.findOne({ where: { uuid, fingerprint } });
      if (!user) {
        user = await User.create({ uuid, fingerprint, emailCount: 0, isPaidUser: true });
      } else {
        user.isPaidUser = true;
        await user.save();
      }

      await BehaviorLog.create({ userId: user.id, action: 'Payment verified', details: `Payment verified for session ${session_id}` });

      storedSession.verified = true;
      await storedSession.save();

      res.redirect(`http://localhost:5000/verify?token=${session_id}`);
    } else {
      res.status(400).json({ msg: 'Payment verification failed.' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/verify', async (req, res) => {
  const { token } = req.query;

  try {
    const tokenRecord = await Token.findOne({ where: { token, used: false, expiryDate: { [Op.gt]: new Date() } } });

    if (!tokenRecord) {
      return res.status(400).json({ msg: 'Invalid or expired token.' });
    }

    const user = await User.findOne({ where: { uuid: tokenRecord.userId } });

    if (!user) {
      return res.status(400).json({ msg: 'User not found.' });
    }

    tokenRecord.used = true;
    await tokenRecord.save();

    res.status(200).json({ msg: 'Payment verified and token redeemed successfully.', token });
  } catch (error) {
    console.error('Error redeeming token:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/redeem-token', async (req, res) => {
  const { token, uuid, fingerprint } = req.body;

  if (!token || !uuid || !fingerprint) {
    console.error('Token, UUID, or fingerprint is missing');
    return res.status(400).json({ msg: 'Token, UUID, and fingerprint are required' });
  }

  try {
    const tokenRecord = await Token.findOne({ where: { token, used: false, expiryDate: { [Op.gt]: new Date() } } });

    if (!tokenRecord) {
      console.error('Invalid or expired token:', token);
      return res.status(400).json({ msg: 'Invalid or expired token.' });
    }

    let user = await User.findOne({ where: { uuid, fingerprint } });
    if (!user) {
      user = await User.create({ uuid, fingerprint, emailCount: 0, isPaidUser: true });
    } else {
      user.isPaidUser = true;
      await user.save();
    }

    tokenRecord.used = true;
    await tokenRecord.save();

    await BehaviorLog.create({ userId: user.id, action: 'Token redeemed', details: `Token ${token} redeemed` });

    res.status(200).json({ msg: 'Token redeemed successfully.' });
  } catch (error) {
    console.error('Error redeeming token:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;




// curl https://api.stripe.com/v1/products \
//   -u "your_stripe_secret_key:" \
//   -d "name=QuickConnect one time" \
//   -d "description=One-time QuickConnect service"


//   curl https://api.stripe.com/v1/prices \
//   -u "your_stripe_secret_key:" \
//   -d "unit_amount=3000" \
//   -d "currency=usd" \
//   -d "product={PRODUCT_ID}"