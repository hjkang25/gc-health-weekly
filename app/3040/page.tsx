import { fetchHealthData } from '../lib/fetchHealthData';
import HealthReceipt from './HealthReceipt';

export const revalidate = 3600; // ISR: 1시간마다 재빌드

export default async function Page() {
  const data = await fetchHealthData();
  return <HealthReceipt data={data} />;
}
