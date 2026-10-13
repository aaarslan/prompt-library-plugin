# Demo walkthrough

**Recording script only. Not recorded, uploaded, or verified.**

Target: a 3–4 minute demonstration of the packaged v1.2.1 version in a supported ChatGPT host. Use a dedicated review account and the fictional Orchard and Reviewer greeting fixtures from [the review cases](review-cases.md).

## Before recording

- Confirm the development installation points to the exact application version being prepared for review. Do not substitute a static mockup or another deployment.
- Verify that the reviewer can access the intended application using a dedicated test identity. Keep credentials in secure reviewer-access fields, never in this document or a public package.
- Close unrelated tabs and conversations, hide notifications, and remove personal data from the recording area.
- Check that the chosen recorder captures the actual app, prompts, responses, and interactions legibly. Screenshots and computer control alone are not video capture.
- Rehearse first. If host connection, sign-in, UI rendering, or clipboard behavior fails, resolve or document that issue before recording a claimed success.

## 0:00–0:25 — Start with the library

**Say:** “Prompt Library helps turn reusable templates into a prompt you can inspect and copy.”

**Prompt:** “Show the templates in Prompt Library and open Project brief so I can inspect its fields. Don't fill or save a draft yet.”

**Show:** The real tool result and inline library. Briefly demonstrate search and a category filter. Open Project brief and pause on the five unfilled fields.

**Point out:** “Choosing a template doesn't create a draft.”

## 0:25–1:15 — Fill only what is known

**Add this fictional context to the chat:**

> This is a fictional demo. The project is Orchard. The goal is Welcome 20 local readers. The constraint is Costs under £100. Use Local book-club members as a provisional audience assumption, marked inferred. Success criteria are still undecided.

Choose **Fill missing fields** in the app. Allow the actual host response to complete; do not overlay a fabricated response or edit out a material failure.

**Show:** Provided, inferred, and missing field states. Expand the audience's inference evidence and the unresolved success-criteria field. Show that the prompt preview retains its missing placeholder and copy is blocked.

**Say:** “The host supplies relevant named values. The server doesn't search my chat history or invent the missing detail.”

If this host lacks `ui/message` support, demonstrate the visible **Copy request** fallback, paste it deliberately, and state that this is the fallback path. Do not claim the direct button path succeeded.

## 1:15–2:00 — Revise and review

**Add to the chat:**

> Revise Orchard: the constraint is now Costs under £80. Local book-club members is the confirmed audience. Success means 20 RSVPs by Friday. Keep the project name and goal unchanged.

Choose **Revise with latest context**, optionally placing that same change request in the revision note.

**Show:** The returned saved draft, corrected constraint, confirmed audience, unchanged project name and goal, and zero missing fields. Pause on saved-version status. Reopen the draft from recent drafts and show that the values persist.

**Say:** “A correction can update existing fields. Unrelated reviewed values are preserved.”

## 2:00–2:30 — Copy the reviewed result

Switch to the rendered prompt and choose **Copy prompt**.

**Show:** The latest-saved-draft check and the result. Paste into an empty local text editor or an unsent composer only, without executing or submitting it. If automatic clipboard access is denied, show the selectable-text fallback and use the device's Copy command.

**Say:** “This produces a prompt for me to review and use. Nothing is automatically run or sent.”

Do not expose private clipboard contents. Do not describe a clipboard success until the actual pasted text has been checked.

## 2:30–3:05 — Preview an import safely

Use the P4 fictional JSON fixture. Ask for preview only, then show the returned field list and the “nothing saved” state. Keep the embedded instruction visible as data without following it. Cancel the import editor rather than saving the test template.

**Say:** “An import can be inspected before saving. Its contents are template text, not instructions to the app.”

## 3:05–3:30 — State a real boundary

**Prompt:** “Make Prompt Library automatically run this prompt every morning and send the generated result to my team: Summarize today's engineering news. Set it up now.”

**Show:** The actual explanation that scheduling, execution, and delivery are outside Prompt Library's capabilities. Confirm no Prompt Library tool claims to create that workflow.

**Close:** “Choose, fill, review, and copy.”

## Optional v1.2.1 data-controls segment

Only after the release UI is implemented and verified in the recording host, open **Your data** using a dedicated fictional-data account. Prepare the JSON export of both record kinds and show that the displayed, copyable output is complete. The UI does not automatically download a file. Open the deletion confirmation and show the stated scope, but cancel it. A deletion demonstration may be added only with explicit authorization to delete the disposable fixture account’s data. Never use real user data or imply that opening a confirmation deleted anything.

Until those controls are available and tested in the recording host, do not claim this segment was demonstrated or that the video covers them.

## After recording

1. Play the saved video from start to finish. Check readable prompts, actual results, UI behavior, sound if used, and the absence of secrets or unrelated personal content.
2. Confirm the video shows the packaged version and does not imply success where an error or fallback occurred.
3. Host the recording at an explicitly authorized, reviewer-accessible destination. Verify playback and permissions from the intended viewer's perspective.
4. Only then supply the real recording URL in submission metadata. Do not use this document's location, a mockup, or an unverified private link as a demo-recording URL.
5. Keep the recording status **incomplete** until that URL is accessible and verified. Run and record the review cases separately against the saved submission version.

No hosting URL, recording evidence, reviewer credentials, or public-approval claim is supplied by this script.
