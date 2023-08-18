const express = require("express");
const app = express();
// This is your test secret API key. 'sk_test_51NbiEjG1o8Hlx628ptBM1MgykKc1G8GVDAFfNXo1jiYVPxEKehxX1DdqORb8aGMhhOfrC54Etzr8g9dhtg8I4OTo00nS8xEQbS'
// Live Key. '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'
const stripe = require("stripe")('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');

app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
  const total = (items.Price * 100).toFixed(0)
  console.log("Total:", total)
  return total;
};

app.post("/create-payment-intent", async (req, res) => {
  const items = req.body;
  const customer = await stripe.customers.create({
    email: items.Email,
    name: items.Name,
  });
  console.log("Name:", items.Name);
  console.log("Email:", items.Email);
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2022-11-15'}
  );

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    customer: customer.id,
    setup_future_usage: "off_session",
    automatic_payment_methods: {
      enabled: true,
    }, 
  });
  
  // res.send({
  //   clientSecret: paymentIntent.client_secret,
  // });
  
  res.json({
    clientSecret: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: 'pk_live_51NbiEjG1o8Hlx628Fydn2FtmPQcxlBvGzjQib0RNHfLTznumh2ePqtcBzKLRHeQSTK1McsrRsnn1GJGuBKqmKCS800YSQTL9xD'
  }); // 'pk_test_51NbiEjG1o8Hlx628TkLNU2psfDEIhEcgSMab1ylvq5OaHW8dc6C60Cq6IF0BQIZyj0EJF1mLhhhCfZHSLIOHXjVF006iI7Y7Go'
}); // 'pk_live_51NbiEjG1o8Hlx628Fydn2FtmPQcxlBvGzjQib0RNHfLTznumh2ePqtcBzKLRHeQSTK1McsrRsnn1GJGuBKqmKCS800YSQTL9xD'

app.listen(7070, () => console.log("Node server listening on port 7070!"));