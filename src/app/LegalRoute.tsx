import { AppLayout } from '@/components/layout/AppLayout';
import { LegalScreen } from '@/features/legal/LegalScreen';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

/** Privacy Policy, Terms of Service, and the Children's Privacy Notice. */
export const LegalRoute = () => {
  useDocumentMeta({
    title: 'EduParty — Privacy Policy, Terms, and Children’s Privacy',
    description:
      'How EduParty handles data: no accounts, no personal data beyond a nickname, and rooms that expire on their own.',
  });

  return (
    <AppLayout>
      <LegalScreen />
    </AppLayout>
  );
};
