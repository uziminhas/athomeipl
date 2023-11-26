'use client';

import If from '~/core/ui/If';
import SubscriptionCard from './SubscriptionCard';

import PlanSelectionForm from '~/app/(app)/settings/subscription/components/PlanSelectionForm';
import BillingPortalRedirectButton from '~/app/(app)/settings/subscription/components/BillingRedirectButton';
import useUserSession from '~/core/hooks/use-user-session';

const Plans = () => {
  const userSession = useUserSession();
  const subscription = userSession?.subscription;
  const customerId = userSession?.customerId;

  if (!subscription) {
    return <PlanSelectionForm customerId={customerId} />;
  }

  return (
    <div className={'flex flex-col space-y-4'}>
      <SubscriptionCard subscription={subscription} />

      <If condition={customerId}>
        <div className={'flex flex-col space-y-2'}>
          <BillingPortalRedirectButton customerId={customerId as string}>
            Manage Billing
          </BillingPortalRedirectButton>

          <span className={'text-xs text-gray-500 dark:text-gray-400'}>
            Visit your Customer Portal to manage your subscription and billing.
          </span>
        </div>
      </If>
    </div>
  );
};

export default Plans;
