# Tool Routing Reference

Per-tool prompting rules. Read only the section for the category you routed to.

> **Verification status.** The Claude section was verified against Anthropic's current model documentation on **2026-08-21**. Every other section describes durable behavior of a tool family rather than a pinned model version, because those lineups move faster than this file does. Where a section names a specific version, treat it as an example of that family's behavior, not as a claim about what is currently shipping — confirm the current version before relying on version-specific advice.

---

## Claude — claude.ai and the Claude API

**Current models.** Claude Fable 5 (`claude-fable-5`) is the most capable widely released model. Claude Opus 5 (`claude-opus-5`) is the general default. Claude Sonnet 5 (`claude-sonnet-5`) is the mid-tier, Claude Haiku 4.5 (`claude-haiku-4-5`) the fast tier. Opus 4.8, 4.7, 4.6 and Sonnet 4.6 remain selectable. All current models carry a 1M-token context window except Haiku 4.5 at 200K.

Assume Opus 5 unless the user names a version.

**Durable prompting rules across current Claude models:**

- Be explicit and specific. Current Claude follows instructions literally — it does exactly what you say, nothing more. Missing context produces a narrow literal reading, not a helpful guess.
- Provide the reasoning WHY, not just the WHAT. Claude generalizes better from an explanation than from a bare rule.
- Always specify output format and length.
- XML tags help on complex multi-section prompts: `<context>`, `<task>`, `<constraints>`, `<output_format>`.
- Opus-tier models over-engineer by default. Add "Only make changes directly requested. Do not add features or refactor beyond what was asked."
- For complex or multi-step work, front-load everything in one turn — intent, constraints, acceptance criteria, relevant files. Extra back-and-forth turns add reasoning overhead and token cost. Use Template M.
- Large context is available, but padding still dilutes attention. Relevant beats plentiful.

**Do not put these in the prompt — they are API or client settings, not prose:**

- **Thinking.** Current Claude models use adaptive thinking and calibrate depth automatically. Do not write "think step by step" or specify a thinking budget. `budget_tokens` is removed on Fable 5, Opus 5, Sonnet 5, Opus 4.7 and 4.8 and returns a 400 error. To nudge depth in prose the only useful levers are "Think carefully before responding" (more) or "Prioritize responding quickly" (less).
- **Effort.** Depth and token spend are controlled by `output_config.effort` — `low`, `medium`, `high`, `xhigh`, `max`, defaulting to `high`. `xhigh` suits most coding and agentic work. This is a request parameter; writing "use maximum effort" in the prompt body does nothing.
- **Assistant prefill.** Seeding the assistant turn with an opening `{` to force JSON returns a 400 on every current Claude model. Use structured outputs (`output_config.format`) instead. If you are adapting an older prompt, the whole scaffold around the prefill — stop sequences, regex extraction, retry-on-parse loops, "output ONLY valid JSON" — comes out with it.

**Fable 5 specifics:**

- Thinking is always on and cannot be disabled.
- Prompts written for earlier models are frequently too prescriptive for it, and the over-specification measurably lowers output quality. When adapting a prompt to Fable 5, cut step-by-step choreography and state the outcome, the constraints, and how to verify success instead.
- Do not instruct it to reproduce or display its reasoning — that can trigger a refusal. Read thinking through the API instead.
- Single requests on hard tasks can run for many minutes. Plan the UX around that rather than prompting for speed.

**Fast mode** is available on Opus 5 and Opus 4.8 only. It is a request setting, not something a prompt can ask for.

---

## Other frontier LLMs

**ChatGPT / GPT models**
- Start with the smallest prompt that achieves the goal — add structure only when it earns its place
- Be explicit about the output contract: format, length, what "done" looks like
- State tool-use expectations explicitly if the model has tool access
- Constrain verbosity when needed: "Respond in under 150 words. No preamble. No caveats."
- Strong at long-context synthesis and tone adherence — lean on those

**Gemini**
- Strong at long-context and multimodal work — use the context window for document-heavy prompts
- Prone to hallucinated citations. Always add "Cite only sources you are certain of. If uncertain, say [uncertain]."
- Can drift from strict output formats — use an explicit format lock with a labelled example
- For grounded tasks add "Base your response only on the provided context. Do not extrapolate."

**Qwen (instruct variants)**
- Excellent instruction following, JSON output, and structured data — lean on those
- Give it a clear system prompt defining the role; it responds well to role context
- Works well with explicit output format specs including JSON schemas
- Shorter focused prompts outperform long complex ones — scope tightly
- Thinking-mode variants exist. In thinking mode, treat it as a reasoning-native model (below). In non-thinking mode, treat it as a standard instruct model.

**Llama / Mistral / open-weight LLMs**
- Shorter prompts work better — these models lose coherence with deeply nested instructions
- Simple flat structure; avoid multi-level hierarchies
- Be more explicit than you would with Claude or GPT — instruction following is weaker
- Always include a role in the system prompt

**DeepSeek-R1**
- Reasoning-native — see below
- May emit reasoning in `<think>` tags by default. Add "Output only the final answer, no reasoning." if that is unwanted.

**MiniMax**
- OpenAI-compatible API — prompts written for GPT models transfer directly
- Strong at instruction following, structured output, and long-context synthesis
- Temperature must be between 0 and 1 inclusive; a prompt that sets it higher will fail
- May emit reasoning in `<think>` tags — add "Output only the final answer, no reasoning tags." if unwanted
- Responds well to explicit role assignment and structured output specs
- For function calling, supports OpenAI-style tool definitions — include tool schemas directly

---

## Reasoning-native models

Covers any model that reasons internally before answering — the OpenAI o-series, DeepSeek-R1, Qwen thinking modes, and current Claude models (which have their own section above). If you are unsure whether a model reasons natively, check its documentation before adding reasoning scaffolding.

- SHORT clean instructions only. These models reason across thousands of internal tokens.
- NEVER add CoT, "think step by step", `<scratchpad>` instructions, or any reasoning scaffolding — it actively degrades output.
- Prefer zero-shot. Add few-shot only if strictly needed and tightly aligned.
- State what you want and what done looks like. Nothing more.
- Where the model exposes a thinking or effort setting, control depth there rather than in prose.
- Keep system prompts tight — long system prompts hurt these models more than they hurt standard instruct models.

---

## Local deployment — Ollama and self-hosted

- ALWAYS ask which model is running before writing. Llama, Mistral, Qwen, and CodeLlama behave differently.
- The system prompt is the most impactful lever. Include it in the output so the user can set it in their Modelfile.
- Shorter simpler prompts outperform complex ones — local models lose coherence with deep nesting.
- Temperature 0.1 for coding and deterministic tasks, 0.7–0.8 for creative work.
- For coding, route to a code-specialized model rather than a general chat model.

---

## Coding agents

**Claude Code**
- Agentic — runs tools, edits files, executes commands autonomously
- Structure: starting state + target state + allowed actions + forbidden actions + stop conditions + checkpoints
- Stop conditions are MANDATORY. Runaway loops are the biggest credit killer.
- Effort and thinking depth are managed by the harness. Do not hardcode an effort level or thinking budget in the prompt.
- Current models are literal — vague first turns produce narrow results. Front-load intent, file scope, constraints, acceptance criteria, and session strategy.
- Current models use fewer tool calls and reason more between them. Instruct tool use explicitly when you need it: "Read all files in /src/auth/ before starting"
- Subagents are spawned less eagerly than they once were. Request one when you want it: "Use a subagent to investigate X so it stays out of main context"
- Opus-tier models over-engineer. Add "Only make changes directly requested. Do not add extra files, abstractions, or features."
- Always scope to specific files and directories. Never give a global instruction without a path anchor.
- Human review triggers required: "Stop and ask before deleting any file, adding any dependency, or affecting the database schema"
- Session hygiene: new task = new session. Use /rewind instead of correcting mid-conversation. /compact at ~50% context, not 90%.
- For complex tasks use Template M — it covers scope, criteria, stop conditions, and session strategy in one block.

**Cursor / Windsurf**
- File path + function name + current behavior + desired change + do-not-touch list + language and version
- Never give a global instruction without a file anchor
- "Done when:" is required — it defines when the agent stops editing
- For complex tasks, split into sequential prompts rather than one large prompt

**Cline**
- Agentic VS Code extension — autonomously edits files, runs terminal commands, uses browser tools
- Runs on whichever LLM the user configured; match the prompting style to that model's section
- Starting state + target state + file scope + stop conditions + approval gates
- Always specify which files to edit and which to leave untouched
- Add "Ask before running terminal commands" or "Ask before installing dependencies" to prevent unwanted actions
- It shows a task list before executing — the user can review and adjust scope there
- For multi-step tasks, break into sequential prompts with clear checkpoints

**GitHub Copilot**
- Write the exact function signature, docstring, or comment immediately before invoking
- Describe input types, return type, edge cases, and what the function must NOT do
- Copilot completes what it predicts, not what you intend — leave no ambiguity in the comment

**Devin / SWE-agent**
- Fully autonomous — can browse the web, run terminal commands, write and test code
- Very explicit starting state and target state required
- The forbidden-actions list is critical. Without it these agents make decisions you did not intend.
- Scope the filesystem: "Only work within /src. Do not touch infrastructure, config, or CI files."

**Antigravity**
- Agent-first IDE. Task-based prompting — describe outcomes, not steps.
- Prompt for an artifact (task list, implementation plan) before execution so you can review it first
- Browser automation is built in — include verification steps: "After building, verify UI at 375px and 1440px using the browser agent"
- Specify autonomy level: "Ask before running destructive terminal commands"
- Do NOT mix unrelated tasks — one deliverable per session

---

## App generators — Bolt / v0 / Lovable / Figma Make / Google Stitch

- Full-stack generators default to bloated boilerplate. Scope it down explicitly.
- Always specify: stack, version, what NOT to scaffold, clear component boundaries
- Lovable responds well to design-forward descriptions — include visual and UX intent
- v0 is Vercel-native — say so if you need non-Next.js output
- Bolt handles full-stack — be explicit about which parts are frontend, backend, and database
- Figma Make is design-to-code native — reference your Figma component names directly
- Google Stitch is prompt-to-UI focused — describe the interface goal, not the implementation. Add "match Material Design 3 guidelines" for Google-native styling.
- Add "Do not add authentication, dark mode, or features not explicitly listed" to prevent feature bloat

---

## Research and orchestration — Perplexity, Manus

- Perplexity search mode: specify search vs analyze vs compare. Add citation requirements. Reframe hallucination-prone questions as grounded queries.
- Manus and Perplexity Computer are multi-agent orchestrators. Describe the end deliverable, not the steps — they decompose internally.
- For Perplexity Computer, specify the output artifact type (report / spreadsheet / code / summary). Add "Flag any data point you are not confident about."
- For long multi-step tasks, add verification checkpoints — each chained step compounds hallucination risk.

---

## Computer-use and browser agents

Covers agents that drive a real browser — clicking, scrolling, filling forms, completing transactions autonomously.

- Describe the outcome, not the navigation steps: "Find the cheapest flight from X to Y on Emirates or KLM, no Boeing 737 Max, one stop maximum"
- Specify constraints explicitly. Without them the agent decides for you.
- Add permission boundaries: "Do not make any purchase. Research only."
- Add a stop condition for irreversible actions: "Ask me before submitting any form, completing any transaction, or sending any message"
- These agents act with the user's real accounts and payment methods. The permission boundary is the most important line in the prompt, not an optional extra.

---

## Image AI — generation

First detect: generating from scratch, or editing an existing image?

- **Midjourney**: Comma-separated descriptors, not prose. Subject first, then style, mood, lighting, composition. Parameters at the end: `--ar 16:9 --style raw`. Negative prompts via `--no [unwanted elements]`. Confirm the current version flag before pinning `--v`.
- **DALL-E 3**: Prose works. Add "do not include text in the image unless specified." Describe foreground, midground, and background separately for complex compositions.
- **Stable Diffusion**: `(word:weight)` syntax. CFG 7–12. Negative prompt is MANDATORY. Steps 20–30 for drafts, 40–50 for finals.
- **SeeDream**: Strong at artistic and stylized generation. Specify art style explicitly (anime, cinematic, painterly) before scene content. Mood and atmosphere descriptors work well. Negative prompt recommended.

Full structure: Template I in templates.md.

## Image AI — reference editing

Detect when: the user mentions "change", "edit", "modify", or "adjust" on an existing image, or uploads a reference.
Always instruct the user to attach the reference image to the tool first. Build the prompt around the delta ONLY — what changes, what stays the same. Template J in templates.md.

## ComfyUI

Node-based workflow, not a single prompt box. Ask which checkpoint model is loaded before writing. Always output two separate blocks, Positive and Negative — never merge them. Template K in templates.md.

---

## 3D AI

**Text to 3D** (Meshy, Tripo, Rodin)
- Describe: style keyword (low-poly / realistic / stylized cartoon) + subject + key features + primary material + texture detail + technical spec
- Negative prompts are supported — use them: "no background, no base, no floating parts"
- Meshy suits game assets and teams. Tripo is fastest for clean topology and rapid prototyping. Rodin gives the highest quality on photorealistic prompts, slower and more expensive.
- Specify the intended export use: game engine (GLB/FBX), 3D printing (STL), web (GLB)
- For characters, specify A-pose or T-pose if the model will be rigged

**In-engine AI** (Unity AI, Blender AI tools)
- Unity AI: `/ask` for documentation and project queries, `/run` for automating repetitive Editor tasks, `/code` for generating or reviewing C#. State exactly what needs to happen in the Editor.
- Unity AI generators cover text-to-sprite, text-to-texture, text-to-animation. Describe asset type, art style, and technical constraints (resolution, palette, loop or one-shot).
- Blender AI add-ons generate Python that executes in Blender. Be specific about geometry, material names, and scene context. Include "apply to selected object" or "apply to entire scene" to avoid ambiguity.

---

## Video AI

- **Sora**: describe as if directing a film shot. Camera movement is critical — static vs dolly vs crane changes the output dramatically.
- **Runway**: responds to cinematic language. Reference film styles for a consistent aesthetic.
- **Kling**: strong at realistic human motion. Describe body movement explicitly and specify camera angle and shot type.
- **LTX Video**: fast and prompt-sensitive. Keep descriptions concise and visual. Specify resolution and motion intensity.
- **Dream Machine (Luma)**: cinematic quality. Reference lighting setups, lens types, and color grading.

---

## Voice AI — ElevenLabs

- Specify emotion, pacing, emphasis markers, and speech rate directly
- Use SSML-like markers for emphasis: indicate which words to stress and where to pause
- Prose descriptions of a delivery do not translate — specify the parameters

---

## Workflow AI — Zapier, Make, n8n

- Trigger app + trigger event → action app + action + field mapping, step by step
- Note auth requirements explicitly: "assumes [app] is already connected"
- For multi-step workflows, number each step and specify what data passes between them
