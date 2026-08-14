import { useMemo } from 'react';

import { AppLayout } from '@/components/layout/AppLayout';
import { ContactScreen } from '@/features/contact/ContactScreen';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { createSupabaseFeedbackService } from '@/lib/feedback/supabaseFeedbackService';

/** Suggestions, new game requests, and bug reports, reachable from anywhere in the app. */
export const ContactRoute = () => {
  useDocumentMeta({
    title: 'EduParty — Contact',
    description: 'Send a suggestion, ask for a new game, or report a bug.',
  });
  const service = useMemo(() => createSupabaseFeedbackService(), []);

  return (
    <AppLayout>
      <ContactScreen submitFeedback={service.submitFeedback} />
    </AppLayout>
  );
};
