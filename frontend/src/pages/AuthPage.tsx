import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

interface AuthPageProps {
  mode: 'login' | 'register';
}

interface RedirectState {
  from?: {
    pathname?: string;
  };
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    return error.response?.data?.detail ?? 'Unable to authenticate. Please try again.';
  }
  return 'Unable to authenticate. Please try again.';
}

export default function AuthPage({ mode }: AuthPageProps) {
  const { user, isLoading, authError, login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = mode === 'register';

  if (isLoading) {
    return null;
  }
  if (user) {
    return <Navigate to="/setup" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const credentials = { email, password };
      if (isRegistering) {
        await register(credentials);
      } else {
        await login(credentials);
      }
      const destination = (location.state as RedirectState | null)?.from?.pathname ?? '/setup';
      navigate(destination, { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 pb-12 pt-28">
      <section className="card-bordered w-full max-w-md p-7 md:p-9">
        <p className="eyebrow text-text-muted">Your private workspace</p>
        <h1 className="editorial mt-3 text-4xl">
          {isRegistering ? 'Create your account' : 'Welcome back.'}
        </h1>
        <p className="mb-7 mt-3 text-sm leading-6 text-text-secondary">
          {isRegistering
            ? 'Create an account to keep your interviews and documents private.'
            : 'Sign in to continue to your private interview workspace.'}
        </p>

        {(error || authError) && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary"
          >
            {error ?? authError}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="form-label">
            Email address
            <input
              autoComplete="email"
              className="form-control mt-2"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="form-label">
            Password
            <input
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              className="form-control mt-2"
              type="password"
              minLength={8}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button
            className="primary-action w-full disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Please wait…'
              : isRegistering
                ? 'Create account'
                : 'Sign in'}
            {!isSubmitting && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-text-secondary">
          {isRegistering ? 'Already have an account?' : 'New to AiiN?'}{' '}
          <Link
            className="text-link font-medium"
            to={isRegistering ? '/login' : '/register'}
          >
            {isRegistering ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </section>
    </main>
  );
}
