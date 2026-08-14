import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useDocumentMeta } from './useDocumentMeta';

describe('useDocumentMeta', () => {
  beforeEach(() => {
    document.title = '';
    document.head.innerHTML = '<meta name="description" content="" />';
  });

  it('sets the tab title and the description meta tag', () => {
    renderHook(() =>
      useDocumentMeta({ title: 'EduParty — Host a Room', description: 'Host copy' }),
    );

    expect(document.title).toBe('EduParty — Host a Room');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Host copy',
    );
  });

  it('updates both again when the route changes to a new title and description', () => {
    const { rerender } = renderHook(
      ({ title, description }: { title: string; description: string }) =>
        useDocumentMeta({ title, description }),
      { initialProps: { title: 'EduParty', description: 'Landing copy' } },
    );

    rerender({ title: 'EduParty — Legal', description: 'Legal copy' });

    expect(document.title).toBe('EduParty — Legal');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Legal copy',
    );
  });
});
