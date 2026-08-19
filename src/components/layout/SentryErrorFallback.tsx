import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';

/**
 * Sentry.ErrorBoundary's fallback: by the time this renders, the error is
 * already on its way to Sentry, so this exists purely to give the Player
 * something other than a blank white screen.
 */
export const SentryErrorFallback = () => (
  <div className="flex min-h-dvh items-center justify-center bg-sky-400 p-6">
    <RetroContainer className="flex max-w-sm flex-col items-center gap-5 p-6 text-center">
      <PageTitle>OOPS!</PageTitle>
      <p className="font-terminal text-xl text-gray-700">
        Something broke on our end. Reloading usually fixes it.
      </p>
      <RetroButton tone="cyan" onClick={() => window.location.reload()}>
        RELOAD
      </RetroButton>
    </RetroContainer>
  </div>
);
