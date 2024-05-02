import AgencyDetails from '@/components/forms/agencyDetails';
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import { currentUser } from '@clerk/nextjs';
import { Plan } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react';

const Page = async ({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string };
}) => {
  const agencyId = await verifyAndAcceptInvitation();
  console.log(agencyId);

  const user = await getAuthUserDetails();
  if (agencyId) {
    if (user?.role === 'SUBACCOUNT_GUEST' || user?.role === 'SUBACCOUNT_USER') {
      return redirect('/subaccount');
    }

    if (user?.role === 'AGENCY_ADMIN' || user?.role === 'AGENCY_OWNER') {
      if (searchParams.plan) {
        return redirect(
          `/agency/${agencyId}/billing?plan=${searchParams.plan}`
        );
      }
      if (searchParams.state) {
        const [statePath, stateAgencyId] = searchParams.state.split('___');

        if (!stateAgencyId) {
          return <div>Not authorized</div>;
        }

        return redirect(
          `/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`
        );
      }

      return redirect(`/agency/${agencyId}`);
    }

    <div>Not authorized</div>;
  }

  const authUser = await currentUser();
  return (
    <div className='flex justify-center items-center mt-4'>
      <div className='max-w-[850px] border-[1px] p-4 rounded-xl'>
        <h1 className='text-4xl'>Create an Agency</h1>
        <AgencyDetails data={{ companyEmail: authUser?.emailAddresses[0]?.emailAddress }} />
      </div>
    </div>
  );
};

export default Page;
