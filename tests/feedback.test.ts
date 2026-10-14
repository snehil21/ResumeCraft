import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_FEEDBACK_ATTACHMENT_BYTES,
  formatFileSize,
  validateFeedback,
} from "../src/utils/feedback.ts";

test("feedback requires a useful message", () => {
  assert.equal(validateFeedback({ email: "", message: "" }).message?.includes("Tell us"), true);
  assert.equal(validateFeedback({ email: "", message: "short" }).message?.includes("10 characters"), true);
  assert.equal(validateFeedback({ email: "", message: "The preview overflows on mobile." }).message, undefined);
});

test("feedback email remains optional but must be valid when supplied", () => {
  assert.equal(validateFeedback({ email: "", message: "A detailed feedback message" }).email, undefined);
  assert.equal(validateFeedback({ email: "invalid", message: "A detailed feedback message" }).email?.includes("valid email"), true);
  assert.equal(validateFeedback({ email: "user@example.com", message: "A detailed feedback message" }).email, undefined);
});

test("feedback accepts supported attachments within five megabytes", () => {
  assert.equal(validateFeedback({
    email: "",
    message: "A detailed feedback message",
    attachment: { type: "image/png", size: MAX_FEEDBACK_ATTACHMENT_BYTES },
  }).attachment, undefined);

  assert.equal(validateFeedback({
    email: "",
    message: "A detailed feedback message",
    attachment: { type: "application/pdf", size: 1_000 },
  }).attachment?.includes("PNG"), true);

  assert.equal(validateFeedback({
    email: "",
    message: "A detailed feedback message",
    attachment: { type: "video/webm", size: MAX_FEEDBACK_ATTACHMENT_BYTES + 1 },
  }).attachment?.includes("5 MB"), true);
});

test("file sizes are presented clearly", () => {
  assert.equal(formatFileSize(800), "800 B");
  assert.equal(formatFileSize(2_048), "2 KB");
  assert.equal(formatFileSize(1_572_864), "1.5 MB");
});
