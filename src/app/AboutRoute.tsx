import { AppLayout } from '@/components/layout/AppLayout';
import { AboutScreen } from '@/features/about/AboutScreen';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

/** The maker's story and the product's differentiators (#152). */
export const AboutRoute = () => {
  useDocumentMeta({
    title: 'EduParty — About',
    description:
      'Why EduParty exists, what makes it different from a classroom-projector game tool, and the story behind the name.',
  });

  return (
    <AppLayout>
      <AboutScreen />
    </AppLayout>
  );
};
