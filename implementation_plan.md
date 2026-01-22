# Implementation Plan - Suno Bridge Integration

This plan outlines the steps to bridge the local Suno Prompt Generator (`sunosuno1`) with the `suno.ai` web interface using Antigravity's browser automation capabilities.

## User Review Required
> [!IMPORTANT]
> This integration relies on `suno.com`'s current DOM structure. If Suno updates their UI, the automation script may need maintenance.
> The Agent must handle authentication on `suno.com` (user may need to log in manually in the browser window if cookies aren't shared).

## Proposed Changes

### Frontend (`sunosuno1`)
#### [MODIFY] [Player.tsx](file:///f:/projects/sunosuno1/components/Player.tsx)
- Update `CopyButton` component to accept an `id` prop.
- Add `id="generated-style-prompt"` to the Style Prompt display.
- Add `id="generated-title"` to the Song Title element.
- Add `id="generated-lyrics"` to the Lyrics Textarea.
- **Reason:** To allow the browser subagent to reliably scrape these values using `document.getElementById()`.

### Automation Scripts
#### [NEW] [.agent/workflows/suno-bridge.md](file:///f:/projects/sunosuno1/.agent/workflows/suno-bridge.md)
- Create a workflow file detailing the steps for the `browser_subagent`.
- **Workflow Steps:**
    1.  Open `http://localhost:3000`.
    2.  Check for `#generated-style-prompt`. If missing, verify if the app is running or waiting for user generation.
    3.  Extract Text: Title, Style Prompt, Lyrics.
    4.  Open `https://suno.com/create`.
    5.  Wait for the "Create" page inputs to load.
    6.  Toggle "Custom Mode" on.
    7.  Inject Title, Style, and Lyrics into respective fields.
    8.  (Optional) Click "Create" or wait for user confirmation.

## Verification Plan
### Automated Tests
- Run the `browser_subagent` with the defined task: "Run the Suno Bridge workflow".
- Verify that the text from `localhost` is correctly populated in `suno.com`.

### Manual Verification
- User generates a prompt in Local App.
- User triggers the command.
- User watches the browser form filling.
