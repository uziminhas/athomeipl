import Alert from '~/core/ui/Alert';
import Subscription from '~/lib/subscriptions/subscription';
import { getMessagesByStatus } from '~/lib/subscriptions/subscription-messages';

function SubscriptionStatusAlert(
  props: React.PropsWithChildren<{
    subscription: Subscription;
    values: {
      endDate: string;
      trialEndDate: string | null;
    };
  }>
) {
  const status = props.subscription.status;
  const messages = getMessagesByStatus(status);

  return (
    <Alert type={messages.type}>
      <Alert.Heading>{messages.heading}</Alert.Heading>

      <span className={'block'}>{messages.description(props.values)}</span>
    </Alert>
  );
}

export default SubscriptionStatusAlert;
