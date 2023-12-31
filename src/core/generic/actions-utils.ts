import { redirect } from 'next/navigation';

import requireSession from '~/lib/user/require-session';
import getSupabaseServerActionClient from '~/core/supabase/action-client';
import isUserSuperAdmin from '~/app/admin/utils/is-user-super-admin';

/**
 * @name withSession
 * @param fn
 * export const action = withSession(async (params) => {
 *   //
 * })
 */
export function withSession<Args extends any[], Return extends unknown>(
  fn: (...params: Args) => Return,
) {
  return async (...params: Args) => {
    const client = getSupabaseServerActionClient();

    await requireSession(client);

    return fn(...params);
  };
}

export function withAdminSession<Args extends any[], Return extends unknown>(
  fn: (...params: Args) => Return,
) {
  return async (...params: Args) => {
    const isAdmin = await isUserSuperAdmin({
      client: getSupabaseServerActionClient(),
    });

    if (!isAdmin) {
      redirect('/');
    }

    return fn(...params);
  };
}
