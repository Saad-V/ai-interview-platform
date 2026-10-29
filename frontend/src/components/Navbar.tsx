import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="text-xl font-semibold tracking-tight" aria-label="AiiN home">
          AiiN
        </Link>
        {!isLoading && (
          <div className="flex items-center gap-5">
            {user ? (
              <>
                <span className="hidden max-w-52 truncate text-sm text-text-secondary sm:inline">
                  {user.email}
                </span>
                <button
                  className="text-link text-sm"
                  onClick={logout}
                  type="button"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className="text-link text-sm" to="/login">Sign in</Link>
                <Link className="primary-action min-h-0 px-4 py-2 text-sm" to="/register">
                  Get started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
