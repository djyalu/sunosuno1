# Tasks

- [ ] **Analyze & Prepare Integration**
    - [x] Check `components/Player.tsx` for prompt display structure.
    - [ ] Add unique IDs to the prompt text area/container in `Player.tsx` for easy Agent access.
- [ ] **Create Automation Workflow**
    - [ ] Create a `suno_bridge_workflow.md` (or similar) instructions for the agent.
    - [ ] Define the browser automation steps:
        1. Read prompt from `localhost:3000`.
        2. Format data (Title, Tags, Prompt).
        3. Switch to `suno.com`.
        4. Fill inputs.
- [ ] **Implement Integration**
    - [ ] Modify `ResultView` (`Player.tsx`) to ensure data is accessible.
- [ ] **Verification**
    - [ ] Run the browser subagent to test the flow (Copy from Local -> Paste to Suno).
