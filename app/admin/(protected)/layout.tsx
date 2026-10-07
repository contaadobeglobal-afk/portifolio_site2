import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/AdminHeader';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase.from('portfolio_profiles').select('role').eq('user_id', user.id).maybeSingle();
  if (!profile || !['admin', 'editor'].includes(profile.role)) redirect('/admin/login?error=Sem+permissão');

  return <div className="admin-shell"><AdminHeader email={user.email ?? ''} />{children}</div>;
}
