import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to home dashboard by default
  redirect('/home');
}
