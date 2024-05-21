const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const { getIo } = require('./socket'); 


/**
 *@description Create a PaymentIntent
 *@method POST
 *@route /payment-intent
 *@use Creates a PaymentIntent with the specified amount and currency and 
       returns the client secret which can be used to confirm the payment 
       on the client side using Stripe.js 
 */

router.post('/payment-intent', async (req, res) => {
    const { amount, currency, paymentMethodId } = req.body;
    if(!amount || !currency || !paymentMethodId) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,  
            currency: currency,
            payment_method: paymentMethodId,
            confirmation_method: 'manual',
            confirm: true,
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status
        });
    } catch (error) {
        console.error('Payment Intent creation failed:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @description Webhook handler for asynchronous events.
 * @method POST
 * @route /webhook
 * @use Handles the payment_intent.succeeded and payment_intent.payment_failed
 *      events using the Stripe SDK and emits a Socket.IO event to the client side
 *      to notify the user of the payment status.
 */

router.post('/webhook', bodyParser.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    if(!sig) return res.status(400).send('Webhook Error: Missing stripe-signature');

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const io = getIo(); // Get the initialized Socket.IO instance
    // Process the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!');
            io.emit('paymentSuccess', { message: 'Payment was successful!', paymentIntentId: paymentIntent.id });
            break;
        case 'payment_intent.payment_failed':
            const error = event.data.object.error.message;
            console.log('PaymentIntent failed:', error);
            io.emit('paymentFailure', { message: 'Payment failed.', reason: error });
            break;
        default:
            console.log('Unhandled event type:', event.type);
    }

    res.json({received: true});
});

module.exports = router;
