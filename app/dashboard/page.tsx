import DashboardClient from './dashboard-client';
import prisma from '@/utils/prisma';
import { User, currentUser } from '@clerk/nextjs/server';

export default async function Page() {
  const user: User | null = await currentUser();

  const docsList = await prisma.document.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <DashboardClient docsList={docsList} />
    </div>
  );
}
