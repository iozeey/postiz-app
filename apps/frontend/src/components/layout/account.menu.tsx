'use client';

import React, { FC, useCallback, useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { LogoutComponent } from '@gitroom/frontend/components/layout/logout.component';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

// Same SWR key and request as OrganizationSelector, so it's fetched once.
const useOrganizations = () => {
  const fetch = useFetch();
  const load = useCallback(async () => {
    return await (await fetch('/user/organizations')).json();
  }, []);
  return useSWR('organizations', load, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    revalidateOnReconnect: false,
  });
};

export const AccountMenu: FC = () => {
  const user = useUser();
  const t = useT();
  const { data } = useOrganizations();

  const organization = useMemo(() => {
    return data?.find?.((d: any) => d.id === user?.orgId);
  }, [data, user?.orgId]);

  const fullName = [user?.name, user?.lastName].filter(Boolean).join(' ');
  const initial = (fullName || user?.email || '?')[0].toUpperCase();

  if (!user?.email) {
    return null;
  }

  return (
    <div className="group relative text-[12px]">
      <div
        className="w-[24px] h-[24px] rounded-full bg-btnPrimary text-white flex items-center justify-center text-[12px] font-[600] cursor-pointer select-none"
        aria-label={user.email}
      >
        {initial}
      </div>
      <div className="hidden group-hover:flex absolute top-[100%] end-0 z-[100] pt-[8px]">
        <div className="flex flex-col gap-[12px] w-max min-w-[220px] max-w-[320px] py-[12px] px-[12px] bg-third border-tableBorder border rounded-[8px] text-newTextColor">
          <div className="flex flex-col gap-[2px]">
            <div className="text-textItemBlur">
              {t('signed_in_as', 'Signed in as')}
            </div>
            {!!fullName && (
              <div className="text-[14px] font-[600] truncate">{fullName}</div>
            )}
            <div className="truncate">{user.email}</div>
            {!!organization?.name && (
              <div className="text-textItemBlur truncate">
                {organization.name}
              </div>
            )}
          </div>
          <div className="h-[1px] bg-blockSeparator" />
          <Link href="/settings" className="hover:underline">
            {t('settings', 'Settings')}
          </Link>
          <LogoutComponent />
        </div>
      </div>
    </div>
  );
};
