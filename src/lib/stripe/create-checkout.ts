import type { Stripe } from 'stripe';
import getStripeInstance from '~/core/stripe/get-stripe';

interface CreateCheckoutParams {
  returnUrl: string;
  userId: string;
  priceId: string;
  customerId?: string;
  trialPeriodDays?: Maybe<number>;
  customerEmail?: string;
  embedded: boolean;
}

/**
 * @name createStripeCheckout
 * @description Creates a Stripe Checkout session, and returns an Object
 * containing the session, which you can use to redirect the user to the
 * checkout page
 * @param params
 */
export default async function createStripeCheckout(
  params: CreateCheckoutParams,
) {
  const clientReferenceId = params.userId;

  // we pass an optional customer ID, so we do not duplicate the Stripe
  // customers if an organization subscribes multiple times
  const customer = params.customerId || undefined;

  // if it's a one-time payment
  // you should change this to "payment"
  // docs: https://stripe.com/docs/billing/subscriptions/build-subscription
  const mode: Stripe.Checkout.SessionCreateParams.Mode = 'subscription';

  // get stripe instance
  const stripe = await getStripeInstance();

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
    quantity: 1,
    price: params.priceId,
  };

  const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData =
    {
      trial_period_days: params.trialPeriodDays,
      metadata: {
        userId: params.userId,
      },
    };

  const urls = getUrls({
    embedded: params.embedded,
    returnUrl: params.returnUrl,
  });

  const uiMode = params.embedded ? 'embedded' : 'hosted';

  return stripe.checkout.sessions.create({
    mode,
    ui_mode: uiMode,
    customer,
    line_items: [lineItem],
    client_reference_id: clientReferenceId.toString(),
    subscription_data: subscriptionData,
    customer_email: params.customerEmail,
    ...urls,
  });
}

function getUrls(params: { returnUrl: string; embedded?: boolean }) {
  const successUrl = `${params.returnUrl}?success=true`;
  const cancelUrl = `${params.returnUrl}?cancel=true`;
  const returnUrl = `${params.returnUrl}/return?session_id={CHECKOUT_SESSION_ID}`;

  return params.embedded
    ? {
        return_url: returnUrl,
      }
    : {
        success_url: successUrl,
        cancel_url: cancelUrl,
      };
}
