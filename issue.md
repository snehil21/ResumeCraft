# Build ResumeCraft into a local-first resume creation and improvement platform

## Summary

ResumeCraft currently provides a basic resume form, two hard-coded layouts, limited accent colors, and browser print-based PDF export. The homepage does not explain the product, provide navigation, show the builder, or help users choose between creating a resume and importing an existing one.

The goal of this issue is to evolve ResumeCraft into a useful, privacy-first resume builder that works locally in the browser. Users should be able to create or import a resume, customize its design, review its quality, save it locally, and download a dependable PDF without creating an account.

This issue is the parent tracker. Each numbered item should be implemented through a focused pull request/MR, reviewed, merged, and checked off here only after its acceptance criteria pass.

## Product principles

- Local/browser-first; no backend dependency for the initial product.
- No account required for core resume creation and export.
- Resume files and personal information remain on the user's device.
- Never invent experience or silently modify imported content.
- Prefer a few reliable templates over many inconsistent templates.
- Give users meaningful control without allowing unreadable output.
- Keep exported PDFs readable, selectable, and recruiter-friendly.
- Do not present an unvalidated percentage as an "ATS score."

## End goal

A user can open ResumeCraft, choose to create or upload a resume, review and edit structured content, customize its presentation, receive actionable quality feedback, safely recover the draft later, and download a polished PDF—all inside the browser.

## Delivery checklist

### Foundation and homepage

- [ ] **1. Add the main navigation and responsive mobile menu**
  - Add the ResumeCraft brand/logo.
  - Add links for Features, Templates, How it works, Privacy, and GitHub.
  - Add a persistent primary **Build my resume** CTA.
  - Make anchor links keyboard accessible and visibly focusable.
  - Keep the navbar compact and sticky while scrolling.

- [ ] **2. Replace the homepage hero with a clear create-or-upload entry point**
  - Explain what ResumeCraft does in one concise headline and supporting paragraph.
  - Add primary actions for **Create new resume** and **Upload existing resume**.
  - State that no account is required and data stays on the user's device.
  - Replace the generic illustration with an actual builder or resume preview.
  - Ensure the complete hero works on desktop and mobile.

- [ ] **3. Build a short, valuable scrolling homepage**
  - Add a create-or-upload explanation section.
  - Add a three-step **How it works** section.
  - Add a product/customization preview section.
  - Add a browser-privacy explanation.
  - Add a final CTA and compact footer.
  - Keep the page focused; do not add fake statistics or testimonials.

- [ ] **4. Add the create-or-upload onboarding flow**
  - Add a dedicated `/start` route.
  - Offer **Start blank**, **Use sample content**, and **Upload existing resume**.
  - Explain what each option will do before the user selects it.
  - Preserve browser back/forward navigation.

### Local-first document foundation

- [ ] **5. Introduce a unified, versioned resume document model**
  - Store content, section order, visibility, template, theme, and page settings in one document.
  - Give sections and entries stable unique IDs.
  - Add a document schema version for future migrations.
  - Remove template-specific ownership of resume data.
  - Ensure all templates consume the same document model.

- [ ] **6. Add local autosave and draft management**
  - Persist the active document locally with Zustand persistence.
  - Display **Saving...**, **Saved locally**, and failure states.
  - Restore the latest draft after refresh or browser restart.
  - Add Start blank, Load sample, and Reset actions.
  - Require confirmation before replacing a non-empty draft.
  - Add JSON project export and import for portable backups.

### Resume upload and parsing

- [ ] **7. Add local file selection and text extraction**
  - Support text-based PDF files.
  - Support DOCX files.
  - Support pasting resume text as a fallback.
  - Reject unsupported, corrupt, password-protected, or oversized files clearly.
  - Detect scanned/image-only PDFs and explain that they are not supported yet.
  - Process supported files entirely in the browser.

- [ ] **8. Build a deterministic resume parser**
  - Detect contact details, links, common section headings, and date ranges.
  - Extract Summary, Experience, Education, Skills, Projects, Certifications, and Achievements.
  - Support common aliases such as **Work History** and **Professional Experience**.
  - Preserve the original extracted text for recovery.
  - Mark ambiguous or unrecognized content instead of discarding it.
  - Add parser tests using anonymized sample resumes.

- [ ] **9. Add an import-review screen before creating the document**
  - Show every detected section and field in editable form.
  - Mark uncertain results as **Needs review**.
  - Show unrecognized text in a separate recoverable area.
  - Allow sections to be included or excluded.
  - Do not write parsed data into the active resume until the user confirms.

### Builder experience

- [ ] **10. Redesign the builder into Content, Design, and Review modes**
  - Use a two-panel desktop layout with a sticky resume preview.
  - Use separate Edit and Preview modes on smaller screens.
  - Update the preview immediately as fields change.
  - Remove the manual section Save workflow.
  - Add undo and redo for recent document edits.
  - Preserve edits when switching sections or modes.

- [ ] **11. Add complete section and entry management**
  - Reorder sections with accessible drag-and-drop or move controls.
  - Show, hide, rename, duplicate, and delete sections.
  - Add, reorder, duplicate, and delete section entries and bullet points.
  - Add structured Skills, Certifications, Languages, Awards, Volunteering, Publications, and Courses sections.
  - Add custom text and custom list sections.
  - Add missing common fields such as location, website, grade, project dates, and current-role status.

- [ ] **12. Add safe design and page controls**
  - Add font family and base font-size controls.
  - Add name, heading, and body text sizing.
  - Add line height, page margins, section spacing, and entry spacing.
  - Add accent and text colors with accessible defaults.
  - Add A4 and Letter page sizes.
  - Add date-format controls.
  - Add one-column/two-column layout and column-ratio controls where supported.
  - Add Compact, Balanced, and Spacious presets.
  - Add **Reset template defaults**.
  - Enforce safe minimum and maximum values.

### Templates, export, and review

- [ ] **13. Build three templates on the shared rendering system**
  - Add **ATS Classic**: conservative single-column layout.
  - Add **Modern Split**: restrained two-column layout.
  - Add **Compact Technical**: dense layout for experienced technical candidates.
  - Make all supported design controls work consistently across templates.
  - Test each template with short, long, and incomplete content.
  - Remove duplicated content-rendering behavior from individual templates.

- [ ] **14. Make PDF preview and export dependable**
  - Match exported A4/Letter dimensions to the preview.
  - Keep PDF text selectable.
  - Keep email, phone, and external links clickable.
  - Show page boundaries and overflow warnings before download.
  - Avoid splitting a resume entry across pages when possible.
  - Ensure builder controls never appear in exported output.
  - Support a meaningful custom PDF filename.
  - Correct inconsistent location, date, and contact-link rendering.

- [ ] **15. Add a local Resume Health review**
  - Detect missing contact information and invalid links.
  - Detect missing or empty important sections.
  - Flag very short, very long, or repetitive bullet points.
  - Flag weak phrasing, first-person language, and dense paragraphs.
  - Flag inconsistent dates and formatting.
  - Flag overly small text, excessive density, and page overflow.
  - Group feedback as **Critical**, **Recommended**, and **Optional**.
  - Link every finding to the relevant editable section.
  - Do not label the result as an ATS score until the scoring approach is validated.

## Definition of done for every PR/MR

- The PR/MR addresses one checklist item or an explicitly documented subset.
- User-visible behavior includes appropriate empty, error, and loading states.
- Existing resume data remains compatible or includes a tested migration.
- TypeScript compilation and the production build pass.
- Relevant automated tests are added or updated.
- Desktop and mobile behavior is manually verified.
- Print/PDF behavior is checked when the change can affect document rendering.
- Accessibility basics are checked: keyboard access, focus visibility, labels, and contrast.
- The PR/MR description links this parent issue and names the checklist item it completes.
- This issue is updated only after the PR/MR is merged and verified on the main branch.


## Out of scope for this parent issue

- User accounts and authentication
- Cloud synchronization
- Server-side resume storage
- Payments or subscriptions
- AI-generated experience or fabricated metrics
- Automatic job applications
- Public resume hosting
- Image OCR for scanned resumes
- A backend-based ATS scoring service

These capabilities can be evaluated only after the local-first product is useful and validated with real users.
