import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useAuth } from '@/lib/AuthContext';

const LOGO =
  'https://media.base44.com/images/public/6aee56731f3f58a24e730082/57f3a7272_generated_image.png';

const LINKS = [
  { to: '/', label: 'Today' },
  { to: '/read', label: 'Bible' },
  { to: '/library', label: 'Studies' },
  { to: '/groups', label: 'Groups' },
  { to: '/journal', label: 'Journal' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const initial = (user?.full_name || user?.email || 'S').trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <Image
              src={LOGO}
              alt="ScripturePath"
              fittingType="fit"
              className="h-8 w-8 object-contain"
            />
            <span className="font-heading text-[19px] tracking-tight">ScripturePath</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-[15px] tracking-[0.02em] transition-colors ${
                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[160px] truncate text-[12px] text-muted-foreground sm:inline">
              {user?.full_name || user?.email}
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-full border border-border bg-secondary font-heading text-[14px] text-foreground">
              {initial}
            </div>
            <button
              type="button"
              onClick={() => logout(true)}
              aria-label="Sign out"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-7 border-t border-border/60 px-5 py-2.5 md:hidden">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-[14px] tracking-[0.04em] transition-colors ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-24 border-t border-border/70">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2.5">
            <Image src={LOGO} alt="" fittingType="fit" className="h-6 w-6 object-contain" />
            <span className="font-heading text-[15px]">ScripturePath</span>
          </div>
          <p className="max-w-[420px] text-[12px] leading-relaxed text-muted-foreground">
            Scripture quotations from the King James Version, in the public domain.
            Read slowly — it is not a race.
          </p>
        </div>
      </footer>
    </div>
  );
}