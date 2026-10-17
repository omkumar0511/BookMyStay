import NewsletterSubscriber from '../models/NewsletterSubscriber.js';

export const subscribeToNewsletter = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const existingSubscriber = await NewsletterSubscriber.findOne({ email });

    if (existingSubscriber) {
      return res.status(200).json({ success: true, message: 'This email is already subscribed.' });
    }

    await NewsletterSubscriber.create({ email });
    res.status(201).json({ success: true, message: 'Thanks for subscribing!' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ success: true, message: 'This email is already subscribed.' });
    }
    next(error);
  }
};
