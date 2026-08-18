import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { RetroTextarea } from '@/components/ui/RetroTextarea';
import { SectionLabel } from '@/components/ui/SectionLabel';
import type { FeedbackCategory, SubmitFeedback } from '@/types/feedbackService';

const CATEGORIES: readonly { id: FeedbackCategory; label: string }[] = [
  { id: 'SUGGESTION', label: 'Suggestion' },
  { id: 'GAME_REQUEST', label: 'New Game Request' },
  { id: 'BUG', label: 'Bug Report' },
];

const isFeedbackCategory = (value: string | null): value is FeedbackCategory =>
  CATEGORIES.some((category) => category.id === value);

const MAX_MESSAGE_LENGTH = 500;

interface ContactScreenProps {
  submitFeedback: SubmitFeedback;
}

/** Lets anyone leave a suggestion, ask for a new cartridge, or report a bug. */
export const ContactScreen = ({ submitFeedback }: ContactScreenProps) => {
  const navigate = useNavigate();
  // A landing-page CTA can point straight at a category (e.g. `?category=GAME_REQUEST`)
  // instead of making the visitor pick it again.
  const [searchParams] = useSearchParams();
  const requestedCategory = searchParams.get('category');
  const [category, setCategory] = useState<FeedbackCategory | null>(
    isFeedbackCategory(requestedCategory) ? requestedCategory : null,
  );
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (category === null) {
      setError('Pick a category first.');
      return;
    }
    const trimmed = message.trim();
    if (trimmed === '') {
      setError('Type a message before sending.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await submitFeedback(category, trimmed);
      setIsSent(true);
    } catch {
      setError('Could not send that. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <RetroContainer className="flex flex-col items-center gap-5 p-6 text-center">
        <PageTitle>THANKS!</PageTitle>
        <p className="font-terminal text-xl text-gray-700">
          Your message made it through. We read every one of these.
        </p>
        <RetroButton tone="cyan" onClick={() => void navigate('/')}>
          BACK TO HOME
        </RetroButton>
      </RetroContainer>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={(event) => void handleSubmit(event)}>
      <RetroContainer className="flex flex-col gap-5 p-6">
        <header className="flex flex-col items-center gap-2 text-center">
          <PageTitle>CONTACT</PageTitle>
          <p className="font-terminal text-lg text-gray-500">
            Suggestions, new game requests, bug reports. This goes straight to us.
          </p>
        </header>

        <div className="flex flex-col gap-2">
          <SectionLabel>Category</SectionLabel>
          {CATEGORIES.map(({ id, label }) => (
            <RetroButton
              key={id}
              tone="yellow"
              pressed={category === id}
              aria-pressed={category === id}
              onClick={() => setCategory(id)}
            >
              {label}
            </RetroButton>
          ))}
        </div>

        <RetroTextarea
          label="Message"
          rows={5}
          maxLength={MAX_MESSAGE_LENGTH}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />

        {error !== null && (
          <p role="alert" className="font-terminal text-lg text-rose-500">
            {error}
          </p>
        )}

        <RetroButton type="submit" tone="green" disabled={isSubmitting}>
          {isSubmitting ? 'SENDING...' : 'SEND'}
        </RetroButton>
        <RetroButton type="button" tone="white" onClick={() => void navigate('/')}>
          BACK
        </RetroButton>
      </RetroContainer>
    </form>
  );
};
