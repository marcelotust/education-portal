import { AppLayout } from '@/components/layout/AppLayout';
import { LegalScreen } from '@/features/legal/LegalScreen';

/** Privacy Policy, Terms of Service, and the Children's Privacy Notice. */
export const LegalRoute = () => (
  <AppLayout>
    <LegalScreen />
  </AppLayout>
);
