import { useEffect } from 'react';

interface DocumentMeta {
  title: string;
  description: string;
}

/**
 * Sets the browser tab title and `<meta name="description">` for whichever
 * route is mounted. This is a single-page app with one static `index.html`,
 * so without this every route — and every social/search preview — would
 * share the landing page's title and description.
 */
export const useDocumentMeta = ({ title, description }: DocumentMeta): void => {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
};
