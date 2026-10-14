export const MAX_FEEDBACK_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_FEEDBACK_MESSAGE_LENGTH = 2_000;

export const FEEDBACK_ATTACHMENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/webm",
  "video/mp4",
] as const;

export type FeedbackType = "bug" | "suggestion" | "other";

type AttachmentLike = Pick<File, "size" | "type">;

interface FeedbackInput {
  email: string;
  message: string;
  attachment?: AttachmentLike | null;
}

export interface FeedbackErrors {
  email?: string;
  message?: string;
  attachment?: string;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFeedback({ email, message, attachment }: FeedbackInput) {
  const errors: FeedbackErrors = {};
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    errors.message = "Tell us what happened or what you would like to improve.";
  } else if (trimmedMessage.length < 10) {
    errors.message = "Please add a little more detail (at least 10 characters).";
  } else if (trimmedMessage.length > MAX_FEEDBACK_MESSAGE_LENGTH) {
    errors.message = `Keep your message under ${MAX_FEEDBACK_MESSAGE_LENGTH.toLocaleString()} characters.`;
  }

  if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address or leave this field blank.";
  }

  if (attachment) {
    if (!FEEDBACK_ATTACHMENT_TYPES.includes(attachment.type as (typeof FEEDBACK_ATTACHMENT_TYPES)[number])) {
      errors.attachment = "Use a PNG, JPG, WebP, WebM, or MP4 file.";
    } else if (attachment.size > MAX_FEEDBACK_ATTACHMENT_BYTES) {
      errors.attachment = "Attachments must be 5 MB or smaller.";
    }
  }

  return errors;
}
