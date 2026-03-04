export const dynamic = 'force-dynamic';

import { fetchHealthData } from '../lib/fetchHealthData';
import DashboardClient from './DashboardClient';

export default async function Page() {
  const data = await fetchHealthData();
  return <DashboardClient data={data} />;
}
