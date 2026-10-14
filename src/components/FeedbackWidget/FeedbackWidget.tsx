import {
  AlertCircle,
  Camera,
  CheckCircle,
  Edit3,
  MessageCircle,
  Paperclip,
  Send,
  Square,
  Trash2,
  Video,
  X,
} from "react-feather";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FeedbackErrors,
  FeedbackType,
  MAX_FEEDBACK_ATTACHMENT_BYTES,
  MAX_FEEDBACK_MESSAGE_LENGTH,
  formatFileSize,
  validateFeedback,
} from "../../utils/feedback";
import styles from "./FeedbackWidget.module.css";

const RECORDING_SECONDS = 15;

const feedbackTypes: Array<{
  id: FeedbackType;
  label: string;
  icon: typeof AlertCircle;
}> = [
  { id: "bug", label: "Issue", icon: AlertCircle },
  { id: "suggestion", label: "Idea", icon: Edit3 },
  { id: "other", label: "Other", icon: MessageCircle },
];

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

function waitForVideo(video: HTMLVideoElement) {
  return new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("The shared screen could not be read."));
  });
}

function getRecordingMimeType() {
  const types = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [errors, setErrors] = useState<FeedbackErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);

  const clearRecordingTimers = () => {
    if (recordingTimerRef.current !== null) window.clearTimeout(recordingTimerRef.current);
    if (recordingIntervalRef.current !== null) window.clearInterval(recordingIntervalRef.current);
    recordingTimerRef.current = null;
    recordingIntervalRef.current = null;
  };

  const stopMediaStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const removeAttachment = () => {
    setAttachment(null);
    setErrors((current) => ({ ...current, attachment: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeWidget = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    clearRecordingTimers();
    stopMediaStream();
    setIsRecording(false);
    setIsOpen(false);
    if (status === "success") {
      setStatus("idle");
      setStatusMessage("");
    }
    window.setTimeout(() => launcherRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (!attachment) {
      setAttachmentUrl("");
      return;
    }

    const url = URL.createObjectURL(attachment);
    setAttachmentUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment]);

  useEffect(() => {
    if (isOpen) window.setTimeout(() => closeRef.current?.focus(), 0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(
    () => () => {
      clearRecordingTimers();
      stopMediaStream();
    },
    [],
  );

  const applyAttachment = (file: File) => {
    const attachmentError = validateFeedback({ email: "", message: "valid message", attachment: file }).attachment;
    if (attachmentError) {
      setErrors((current) => ({ ...current, attachment: attachmentError }));
      return false;
    }

    setAttachment(file);
    setErrors((current) => ({ ...current, attachment: undefined }));
    setStatus("idle");
    setStatusMessage("");
    return true;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) applyAttachment(file);
  };

  const captureScreenshot = async () => {
    setErrors((current) => ({ ...current, attachment: undefined }));
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("Screen capture is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      mediaStreamRef.current = stream;
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await waitForVideo(video);
      await video.play();

      const longestSide = Math.max(video.videoWidth, video.videoHeight);
      const scale = Math.min(1, 1600 / longestSide);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("The screenshot could not be created.");
      applyAttachment(new File([blob], `resumecraft-screenshot-${Date.now()}.png`, { type: "image/png" }));
    } catch (error) {
      const message = error instanceof DOMException && error.name === "NotAllowedError"
        ? "Screen sharing was cancelled."
        : error instanceof Error
          ? error.message
          : "The screenshot could not be created.";
      setErrors((current) => ({ ...current, attachment: message }));
    } finally {
      stopMediaStream();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  };

  const startRecording = async () => {
    setErrors((current) => ({ ...current, attachment: undefined }));
    try {
      if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Screen recording is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 12 },
        audio: false,
      });
      mediaStreamRef.current = stream;
      const chunks: Blob[] = [];
      const mimeType = getRecordingMimeType();
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 750_000,
      });

      mediaRecorderRef.current = recorder;
      setRecordingSeconds(0);
      setIsRecording(true);

      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => {
        setErrors((current) => ({ ...current, attachment: "The recording could not be created." }));
      };
      recorder.onstop = () => {
        clearRecordingTimers();
        stopMediaStream();
        setIsRecording(false);
        mediaRecorderRef.current = null;
        const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
        if (blob.size) {
          applyAttachment(new File([blob], `resumecraft-recording-${Date.now()}.webm`, { type: "video/webm" }));
        }
      };
      stream.getVideoTracks()[0]?.addEventListener("ended", stopRecording, { once: true });
      recorder.start(500);
      recordingIntervalRef.current = window.setInterval(
        () => setRecordingSeconds((seconds) => seconds + 1),
        1_000,
      );
      recordingTimerRef.current = window.setTimeout(stopRecording, RECORDING_SECONDS * 1_000);
    } catch (error) {
      stopMediaStream();
      const errorMessage = error instanceof DOMException && error.name === "NotAllowedError"
        ? "Screen sharing was cancelled."
        : error instanceof Error
          ? error.message
          : "The recording could not be started.";
      setErrors((current) => ({ ...current, attachment: errorMessage }));
      setIsRecording(false);
    }
  };

  const resetForm = () => {
    setFeedbackType("bug");
    setEmail("");
    setMessage("");
    removeAttachment();
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateFeedback({ email, message, attachment });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setStatus("error");
      setStatusMessage("Please correct the highlighted fields.");
      return;
    }

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      setStatus("error");
      setStatusMessage("Feedback delivery is not configured yet.");
      return;
    }

    setStatus("submitting");
    setStatusMessage("");
    const data = new FormData();
    data.append("access_key", accessKey);
    data.append("subject", `[ResumeCraft ${feedbackType}] New feedback`);
    data.append("from_name", "ResumeCraft Feedback");
    data.append("feedback_type", feedbackType);
    data.append("message", message.trim());
    data.append("page", window.location.href);
    data.append("viewport", `${window.innerWidth}x${window.innerHeight}`);
    data.append("browser", navigator.userAgent);
    data.append("submitted_at", new Date().toISOString());
    data.append("botcheck", "");
    if (email.trim()) data.append("email", email.trim());
    if (attachment) data.append("attachment", attachment, attachment.name);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) throw new Error(result.message || "Feedback could not be sent.");

      resetForm();
      setStatus("success");
      setStatusMessage("Thank you—your feedback has been sent.");
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Feedback could not be sent. Please try again.");
    }
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      closeWidget();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          ref={launcherRef}
          type="button"
          className={styles.launcher}
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
        >
          <MessageCircle aria-hidden="true" />
          <span>Feedback</span>
        </button>
      )}

      {isOpen && (
        <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && closeWidget()}>
          <div
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            onKeyDown={handleDialogKeyDown}
          >
            <header className={styles.header}>
              <div>
                <span className={styles.eyebrow}>Help improve ResumeCraft</span>
                <h2 id="feedback-title">Report an issue or share an idea</h2>
              </div>
              <button ref={closeRef} type="button" className={styles.closeButton} onClick={closeWidget} aria-label="Close feedback form">
                <X aria-hidden="true" />
              </button>
            </header>

            {status === "success" ? (
              <div className={styles.success} role="status">
                <span className={styles.successIcon}><CheckCircle aria-hidden="true" /></span>
                <h3>Feedback received</h3>
                <p>{statusMessage}</p>
                <button type="button" onClick={closeWidget}>Done</button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <fieldset className={styles.typeFieldset}>
                  <legend>What would you like to share?</legend>
                  <div className={styles.typeOptions}>
                    {feedbackTypes.map(({ id, label, icon: Icon }) => (
                      <label key={id} className={feedbackType === id ? styles.typeActive : undefined}>
                        <input
                          type="radio"
                          name="feedback-type"
                          value={id}
                          checked={feedbackType === id}
                          onChange={() => setFeedbackType(id)}
                        />
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className={styles.field}>
                  <span>What happened? <b>Required</b></span>
                  <textarea
                    value={message}
                    onChange={(event) => {
                      setMessage(event.target.value);
                      setErrors((current) => ({ ...current, message: undefined }));
                      setStatus("idle");
                      setStatusMessage("");
                    }}
                    rows={5}
                    maxLength={MAX_FEEDBACK_MESSAGE_LENGTH}
                    placeholder="Describe the issue, what you expected, or how we can improve."
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "feedback-message-error" : "feedback-message-count"}
                  />
                  <span id="feedback-message-count" className={styles.fieldMeta}>{message.length}/{MAX_FEEDBACK_MESSAGE_LENGTH}</span>
                  {errors.message && <span id="feedback-message-error" className={styles.fieldError} role="alert">{errors.message}</span>}
                </label>

                <label className={styles.field}>
                  <span>Email <b>Optional</b></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrors((current) => ({ ...current, email: undefined }));
                      setStatus("idle");
                      setStatusMessage("");
                    }}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "feedback-email-error" : "feedback-email-hint"}
                  />
                  <span id="feedback-email-hint" className={styles.fieldHint}>Only needed if you would like a reply.</span>
                  {errors.email && <span id="feedback-email-error" className={styles.fieldError} role="alert">{errors.email}</span>}
                </label>

                <section className={styles.attachmentSection} aria-labelledby="attachment-title">
                  <div className={styles.sectionHeading}>
                    <div>
                      <h3 id="attachment-title">Show us what you saw</h3>
                      <p>Optional · one image or video · up to {formatFileSize(MAX_FEEDBACK_ATTACHMENT_BYTES)}</p>
                    </div>
                  </div>

                  {!attachment && !isRecording && (
                    <div className={styles.attachmentActions}>
                      <button type="button" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip aria-hidden="true" /> Upload
                      </button>
                      <button type="button" onClick={captureScreenshot}>
                        <Camera aria-hidden="true" /> Screenshot
                      </button>
                      <button type="button" onClick={startRecording}>
                        <Video aria-hidden="true" /> Record screen
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    className={styles.fileInput}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,video/webm,video/mp4"
                    onChange={handleFileChange}
                  />

                  {isRecording && (
                    <div className={styles.recording} role="status">
                      <span className={styles.recordingDot} />
                      <div><strong>Recording your shared screen</strong><span>{recordingSeconds}s / {RECORDING_SECONDS}s</span></div>
                      <button type="button" onClick={stopRecording}><Square aria-hidden="true" /> Stop</button>
                    </div>
                  )}

                  {attachment && attachmentUrl && (
                    <div className={styles.attachmentPreview}>
                      {attachment.type.startsWith("image/") ? (
                        <img src={attachmentUrl} alt="Selected feedback attachment preview" />
                      ) : (
                        <video src={attachmentUrl} controls aria-label="Selected feedback video preview" />
                      )}
                      <div className={styles.attachmentDetails}>
                        <span><strong>{attachment.name}</strong><small>{formatFileSize(attachment.size)}</small></span>
                        <button type="button" onClick={removeAttachment} aria-label={`Remove ${attachment.name}`}>
                          <Trash2 aria-hidden="true" /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                  {errors.attachment && <span className={styles.fieldError} role="alert">{errors.attachment}</span>}
                </section>

                <p className={styles.privacyNote}>
                  Nothing is captured automatically. When you submit, your message, optional contact details, attachment, and basic browser diagnostics are sent through Web3Forms. Resume content is never added automatically.
                </p>

                {statusMessage && (
                  <p className={styles.submitError} role="alert">{statusMessage}</p>
                )}

                <button className={styles.submitButton} type="submit" disabled={status === "submitting" || isRecording}>
                  <Send aria-hidden="true" />
                  {status === "submitting" ? "Sending…" : "Send feedback"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
