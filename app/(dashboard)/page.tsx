import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to capture page by default
  redirect('/capture');
}
