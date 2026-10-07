import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

export default function AdminHeader({ email }: { email: string }) {
  return <header className="admin-header"><div className="admin-wrap admin-header-inner"><Link className="admin-logo" href="/admin">ANIMA / ADMIN</Link><nav className="admin-nav"><Link href="/admin">Projetos</Link><Link href="/" target="_blank">Ver site ↗</Link><span style={{ color: '#858179' }}>{email}</span><LogoutButton /></nav></div></header>;
}
