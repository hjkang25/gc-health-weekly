export const dynamic = 'force-dynamic';

import { fetchHealthData } from '../lib/fetchHealthData';
import HealthReceipt from './HealthReceipt';

export default async function Page() {
  const data = await fetchHealthData();
  return <HealthReceipt data={data} />;
}
