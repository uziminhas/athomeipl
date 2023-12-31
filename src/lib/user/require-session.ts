import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import verifyRequiresMfa from '~/core/session/utils/check-requires-mfa';
import configuration from '~/configuration';
import { Database } from '~/database.types';

/**
 * @name requireSession
 * @description Require a session to be present in the request
 */
async function requireSession(
  client: SupabaseClient<Database>,
  params = {
    verifyFromServer: true,
  },
) {
  const { data, error } = await client.auth.getSession();

  if (!data.session || error) {
    return redirect(configuration.paths.signIn);
  }

  const requiresMfa = await verifyRequiresMfa(client);

  // If the user requires multi-factor authentication,
  // redirect them to the page where they can verify their identity.
  if (requiresMfa) {
    return redirect(configuration.paths.signInMfa);
  }

  if (params.verifyFromServer) {
    const { data: user, error } = await client.auth.getUser();

    if (!user || error) {
      return redirect(configuration.paths.signIn);
    }
  }

  return data.session;
}

export default requireSession;
