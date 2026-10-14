# Demo walkthrough

**A real development demo was recorded on October 14, 2026. Public hosting and reviewer access remain incomplete.**

The local release artifact is `releases/prompt-library-demo-v2.0.0.mp4`: a silent 5:02 H.264 recording, 1320×1066, about 2.4 MB. It shows the actual ChatGPT app with fictional Demo records. The owner explicitly authorized using the isolated Demo workspace for recording. Account navigation is cropped, pauses are shortened, and playback is accelerated 1.3×. The three negative-case results are revisited in their real conversations after correcting the capture target. The optional data-controls segment is not included. The sequence below remains a repeatable walkthrough; the recording uses direct chat prompts for filling and revision and verifies native selectable-text copy/paste into an unsent composer.

Target: a 5–6 minute demonstration of the packaged v2.0.0 version in a supported ChatGPT host. Use a dedicated adult (18+) review account and the fictional Orchard and Reviewer greeting fixtures from [the review cases](review-cases.md).

## Before recording

The app, listing, and published policies are adults only (18+). The eligibility notice does not technically verify age. Use an existing adult test identity; keep owner data and account history out of the recording.


- Select the Demo workspace and keep `workspace: "demo"` on every related tool call, including export and deletion. Verify the visible Demo label before entering fictional data.
- Confirm the development installation points to the exact application version being prepared for review. Do not substitute a static mockup or another deployment.
- Verify that the reviewer can access the intended application using a dedicated test identity. Keep credentials in secure reviewer-access fields, never in this document or a public package.
- Close unrelated tabs and conversations, hide notifications, and remove personal data from the recording area.
- Check that the chosen recorder captures the actual app, prompts, responses, and interactions legibly. Screenshots and computer control alone are not video capture.
- Rehearse first. If host connection, sign-in, UI rendering, or clipboard behavior fails, resolve or document that issue before recording a claimed success.

## 0:00–0:25 — Start with the library

**Say:** “Prompt Library helps turn reusable templates into a prompt you can inspect and copy.”

**Prompt:** “Use the Demo workspace. Show the templates in Prompt Library and open Project brief so I can inspect its fields. Don't fill or save a draft yet.”

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

## 3:05–4:00 — Save a fictional custom template and preserve its draft

Use the P5 prompt from the review cases. Save Reviewer greeting with body `Hello {{person}}.`, prepare it with the fictional person River, and capture the actual returned identifiers. Update that same template body to `Welcome {{person}}.`. Reopen the existing draft and show its saved rendering remains exactly `Hello River.`. Do not execute it. This demonstrates that a saved draft retains its template snapshot.

## 4:00–5:15 — Show all three unsupported-request boundaries

**Prompt:** “Make Prompt Library automatically run this prompt every morning and send the generated result to my team: Summarize today's engineering news. Set it up now.”

**Show:** The actual explanation that scheduling, execution, and delivery are outside Prompt Library's capabilities. Confirm no Prompt Library tool claims to create that workflow.

Repeat N2 and N3 from the review cases in fresh test conversations. Show the actual explanation for invisible account-wide history retrieval and unsupported public sharing/Notion synchronization. Keep the dedicated test account's unrelated history out of the recording. Confirm no Prompt Library tool claims to recover unseen chats, publish a public library, or grant team permissions.

**Close:** “Choose, fill, review, and copy.”

## 5:15–5:45 — Optional v2.0.0 data-controls segment

Only after the release UI is implemented and verified in the recording host, open **Demo data** using a dedicated fictional-data account. Prepare the JSON export of both record kinds and show that the displayed, copyable output is complete. The UI does not automatically download a file. Open the deletion confirmation and show the stated scope, but cancel it. A deletion demonstration may be added only with explicit authorization to delete the disposable fixture account’s data. Never use real user data or imply that opening a confirmation deleted anything.

Until those controls are available and tested in the recording host, do not claim this segment was demonstrated or that the video covers them.

## After recording

1. Play the saved video from start to finish. Check readable prompts, actual results, UI behavior, sound if used, and the absence of secrets or unrelated personal content.
2. Confirm the video shows the packaged version and does not imply success where an error or fallback occurred.
3. Host the recording at an explicitly authorized, reviewer-accessible destination. Verify playback and permissions from the intended viewer's perspective.
4. Only then supply the real recording URL in submission metadata. Do not use this document's location, a mockup, or an unverified private link as a demo-recording URL.
5. Keep the recording status **incomplete** until that URL is accessible and verified. Run and record the review cases separately against the saved submission version.

The recording has no verified public URL yet. No reviewer credentials, submission, or approval are established by this walkthrough.

## Ready-to-run recording setup

- Use an existing dedicated adult test identity with only fictional app records. The canonical Site currently admits the owner alone; any necessary test/reviewer viewer grant must be narrow and authorized. Never share the owner's account credentials or rely on access to their email or phone.
- The Mac has its built-in QuickTime Player and an installed video converter available. Once the test identity and ChatGPT connection work, use the actual app in a fresh conversation and record only that chat region. Hide account history, unrelated windows, and notifications. Set microphone capture to none unless narration is deliberately enabled.
- Rehearse all five positive and three negative cases before capturing a success demonstration. Record failures and fallbacks honestly. The copy step must paste only the verified fictional result into an unsent destination.
- Save the real recording, review playback, and host it through an existing authorized publisher destination. Add a URL to metadata only after the file exists and reviewer playback/access are verified. Native screen-capture permissions, if requested, require the owner's action.

Current execution state: source 2.0.0 is deployed as canonical Sites version 15 with resource v6 and the launch caps. The card works in Chrome and Safari. Development rehearsal covered catalog discovery, provenance, revision and reopening, import preview, saved snapshots, and the three unsupported requests. Independent readback confirmed Orchard version 2 and the unchanged `Hello River.` draft alongside the updated `Welcome {{person}}.` template. This is development-host evidence, not execution against a saved submission or a dedicated reviewer installation.

## Remaining reviewer setup

The existing personal Sites plugin cannot currently be directly shared with another ChatGPT user. Granting access to the Site alone does not install or share its plugin. Confirm an existing-App-compatible public review and test-installation path before inviting a reviewer or creating another connection. Preserve the original App and owner-only audience until a useful, narrow reviewer grant is authorized.

After that path works, use a dedicated adult test account with fictional data, its own authentication, and access to both the plugin and Site. Check that sign-in and every case work without approval from the owner's mailbox, phone, MFA, or private network. Enter the exact login URL, account details, workspace, and sign-in steps only in secure portal fields. Never provide the owner's real credentials.

The recorded MP4 played through to the end in Chrome and passed a complete decode check. It fits the existing publisher's static-asset size limit. Hosting was not completed: the expired Wrangler login was followed by a timed-out authorization and then an explicit `Consent denied` result. No further authorization attempt or paid fallback was made. An isolated hosting candidate based on the existing public release matches the live entry assets and adds only the demo page and MP4. Its build and deployment dry run passed; it has not been deployed.

## Platform issue to resolve before submission

The verified organization's Plugins page shows no existing Prompt Library entry. Its upload dialog accepts a ZIP and verified developer identity but exposes no canonical App reuse selector. The existing personal plugin's detail page offers private version management, not public submission. Public uploads cannot contain App bindings. Ask OpenAI for a supported route that attaches the existing Sites App and plugin to the verified publishing organization and enables reviewer installation without duplicating either identity. Preserve the owner-only audience until that route is established.

The support follow-up draft records these blockers. It has not been sent. No reviewer invitation, account creation, directory submission, or public publication has occurred.
