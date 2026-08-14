export type FeedbackCategory = 'SUGGESTION' | 'GAME_REQUEST' | 'BUG';

export type SubmitFeedback = (category: FeedbackCategory, message: string) => Promise<void>;

/** Injected into ContactScreen so its spec never touches the network. */
export interface FeedbackService {
  submitFeedback: SubmitFeedback;
}
