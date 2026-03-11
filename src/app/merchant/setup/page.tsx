import { redirect } from 'next/navigation';

export default function MerchantSetupPage() {
  // Public signups are disabled. Merchants are now onboarded by Admins/Agents.
  redirect('/merchant/login');
}
