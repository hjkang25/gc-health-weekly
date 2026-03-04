import { fetchHealthData } from '../lib/fetchHealthData';
import HealthReceipt from './HealthReceipt';

export const revalidate = 86400; // ISR: 24시간 기본 갱신 (매주 월요일 /api/revalidate cron으로 명시적 갱신)

export default async function Page() {
  const data = await fetchHealthData();
  return <HealthReceipt data={data} />;
}
