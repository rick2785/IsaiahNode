const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();

// This is your test secret API key. 'sk_test_'
// Live Key. 'sk_live_'
const stripe = require('stripe')(process.env.API_LIVE_SKEY);
// console.log('Test Key:', process.env.API_TEST_SKEY);

app.use(express.static('public'));
app.use(express.json());

const calculateOrderAmount = (items) => {
  const total = (items.Price * 100).toFixed(0)
  console.log('Total:', total)
  return total;
};

app.post('/create-payment-intent', async (req, res) => {
  const items = req.body;
  const customer = await stripe.customers.create({
    email: items.Email,
    name: items.Name,
  });
  console.log('Name:', items.Name);
  console.log('Email:', items.Email);
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2025-02-24.acacia'}
  );

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: 'usd',
    customer: customer.id,
    setup_future_usage: 'off_session',
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never',
    }, 
  });
  
  // res.send({
  //   clientSecret: paymentIntent.client_secret,
  // });
  
  res.json({
    clientSecret: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: process.env.API_LIVE_PKEY,
  });
  // console.log(`Publishable Key: ${process.env.API_TEST_PKEY}`)
}); // 'pk_live_'

app.listen(process.env.PORT, () => console.log(`Node server listening on port ${process.env.PORT}!`));