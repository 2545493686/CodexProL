export const TOOL_CARD_URI = "ui://widget/codexpro-tool-card-v9.html";
export const TOOL_CARD_MIME_TYPE = "text/html;profile=mcp-app";

export const toolCardWidgetHtml = String.raw`
<div id="root" class="wrap">
  <article class="cpx-card"><pre class="cpx-textbox" dir="ltr">waiting</pre></article>
</div>

<style>
  :root { color-scheme: dark; }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: transparent;
  }

  .wrap {
    width: 100%;
  }

  .cpx-card {
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .cpx-textbox {
    margin: 0;
    max-height: 120px;
    overflow: hidden;
    padding: 8px 10px;
    border: 1px solid #30363d;
    border-radius: 8px;
    background: #0d1117;
    color: #e6edf3;
    font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    letter-spacing: 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
</style>

<script>
  const root = document.getElementById("root");

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }


  function countLines(value) {
    const text = String(value || "");
    if (!text) return 0;
    return text.replace(/\n$/, "").split("\n").length;
  }






  function pill(text, cls) {
    return "";
  }






  function tailLines(value, maxLines = 3) {
    const text = String(value || "").replace(/\n$/, "");
    if (!text) return [];
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    return lines.slice(Math.max(0, lines.length - maxLines));
  }

  function shortValue(value, max = 180) {
    const text = String(value ?? "-").replace(/\s+/g, " ").trim();
    return text.length > max ? text.slice(0, max - 1) + "…" : text;
  }

  function lineText(line) {
    if (typeof line === "string") return line;
    if (line && typeof line === "object") return String(line.text ?? "");
    return String(line ?? "");
  }

  function textBox(lines) {
    const safeLines = (Array.isArray(lines) ? lines : [lines])
      .map(lineText)
      .filter((line) => line.length);
    const text = safeLines.length ? safeLines.join("\n") : "done";
    return '<pre class="cpx-textbox" dir="ltr">' + esc(text) + '</pre>';
  }

  function compactCard(data, pills, lines, extraClass) {
    return '<article class="cpx-card">' + textBox(lines) + '</article>';
  }

  function pathLine(label, value) {
    return label + ': ' + shortValue(value || '-');
  }

  function shortSource(value) {
    if (value === "workspace") return "repo";
    if (value === "plugin") return "plug";
    if (value === "user") return "user";
    return "skill";
  }


  function renderFile(data) {
    const pills = [
      data.bytes !== undefined ? pill(data.bytes + " bytes") : "",
      data.additions !== undefined ? pill("+" + data.additions, "good") : "",
      data.deletions !== undefined ? pill("-" + data.deletions, "bad") : "",
      data.replacements !== undefined ? pill(data.replacements + " repl", "info") : ""
    ].join("");
    const lines = [
      pathLine("file", data.path || data.plan_path || "file"),
      "op: " + shortValue(data.codexpro_tool || "file"),
      data.replacements !== undefined ? "replacements: " + data.replacements : "bytes: " + shortValue(data.bytes ?? "-"),
      data.additions !== undefined || data.deletions !== undefined ? "diff: +" + (data.additions ?? 0) + " / -" + (data.deletions ?? 0) : "content: hidden"
    ];
    return compactCard(data, pills, lines, "file-compact");
  }

  function renderChanges(data) {
    const files = Array.isArray(data.changed_files) ? data.changed_files : [];
    const hasGitError = Boolean(data.status_error || data.diff_error);
    const changed = Boolean(data.changed);
    const pills = [
      hasGitError ? pill("git unavailable", "warn") : changed ? pill("changed", "info") : pill("clean", "good"),
      data.additions !== undefined ? pill("+" + data.additions, "good") : "",
      data.deletions !== undefined ? pill("-" + data.deletions, "bad") : ""
    ].join("");
    const fileLines = files.slice(0, 3).map((line) => "file: " + shortValue(line));
    const lines = [
      hasGitError ? "git: " + shortValue(data.status_error || data.diff_error) : "changed files: " + files.length,
      "diff: +" + (data.additions ?? 0) + " / -" + (data.deletions ?? 0),
      files.length > 3 ? "showing 3 of " + files.length + " files" : "diff content: hidden",
      ...fileLines
    ];
    return compactCard(data, pills, lines, "changes-compact");
  }


  function renderWorkspace(data) {
    const skills = Array.isArray(data.skill_inventory) ? data.skill_inventory : (Array.isArray(data.skills) ? data.skills : []);
    const skillCount = Number(data.skill_counts?.total ?? skills.length);
    const gitLines = String(data.git_status || "").split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("##"));
    const agentsLabel = data.agents_loaded ? (data.agents_path || "AGENTS.md") : "no AGENTS";
    const pills = [
      pill(agentsLabel, data.agents_loaded ? "good" : "warn"),
      pill(skillCount + " skills", skillCount ? "info" : ""),
      data.tool_mode ? pill("tools " + data.tool_mode) : ""
    ].join("");
    const lines = [
      pathLine("root", data.root || "."),
      "write: " + shortValue(data.write_mode || "-"),
      "bash: " + shortValue(data.bash_mode || "-") + " | tools: " + shortValue(data.tool_mode || "-"),
      "git: " + (gitLines.length ? gitLines.length + " changed" : "clean"),
      "skills: " + skillCount + " | tree: " + (data.tree ? "hidden" : "none")
    ];
    return compactCard(data, pills, lines, "workspace-compact");
  }

  function renderHandoff(data) {
    const pills = [
      data.agent_name ? pill(data.agent_name, "info") : "",
      data.model ? pill(data.model) : "",
      data.additions !== undefined ? pill("+" + data.additions, "good") : "",
      data.deletions !== undefined ? pill("-" + data.deletions, "bad") : ""
    ].join("");
    const lines = [
      "agent: " + shortValue(data.agent_name || data.agent || "handoff"),
      data.model ? "model: " + shortValue(data.model) : "model: -",
      data.plan_path ? pathLine("plan", data.plan_path) : "plan: hidden",
      data.status_path ? pathLine("status", data.status_path) : "status: hidden",
      data.additions !== undefined || data.deletions !== undefined ? "diff: +" + (data.additions ?? 0) + " / -" + (data.deletions ?? 0) : "diff content: hidden"
    ];
    return compactCard(data, pills, lines, "handoff-compact");
  }

  function renderBash(data) {
    const exitCode = Number(data.exitCode);
    const ok = exitCode === 0;
    const stdoutLines = countLines(data.stdout);
    const stderrLines = countLines(data.stderr);
    const totalLines = stdoutLines + stderrLines;
    const output = data.stderr || data.stdout || "";
    const finalLines = tailLines(output, 3);
    const pills = [
      pill(ok ? "exit 0" : "exit " + shortValue(data.exitCode ?? "?"), ok ? "good" : "bad"),
      pill(totalLines + " lines", "info"),
      pill((data.durationMs ?? "-") + " ms")
    ].join("");
    const lines = [
      { text: "$ " + shortValue(data.command || "", 260) },
      { text: "exit code: " + shortValue(data.exitCode ?? "-") },
      ...(finalLines.length ? finalLines : ["output: none"])
    ];
    return compactCard(data, pills, lines, "bash-compact");
  }

  function renderSearch(data) {
    const count = Array.isArray(data.matches) ? data.matches.length : 0;
    const lines = String(data.text || "").split("\\n").filter(Boolean);
    const preview = lines.slice(0, 3).map((line) => "match: " + shortValue(line, 220));
    const out = [
      "matches: " + count,
      "engine: " + shortValue(data.used || "search"),
      preview.length ? "showing first " + preview.length + " result(s)" : "no matches",
      ...preview
    ];
    return compactCard(data, pill(count + " matches", "info") + pill(data.used || "search"), out, "search-compact");
  }

  function renderSelfTest(data) {
    const checks = Array.isArray(data.checks) ? data.checks : [];
    const status = String(data.status || "unknown");
    const pills = [
      pill(status, status === "pass" ? "good" : status === "fail" ? "bad" : "warn"),
      pill((data.expected_tool_count ?? "-") + " tools", "info"),
      pill((data.duration_ms ?? "-") + " ms")
    ].join("");
    const badChecks = checks.filter((check) => check?.status && check.status !== "pass").slice(0, 3).map((check) => "check: " + shortValue((check?.name || "check") + " - " + (check?.detail || check?.status || ""), 220));
    const lines = [
      "status: " + status,
      "passed: " + (data.passed ?? 0) + " | warned: " + (data.warned ?? 0) + " | failed: " + (data.failed ?? 0),
      "checks: " + checks.length,
      ...(badChecks.length ? badChecks : ["details: hidden"])
    ];
    return compactCard(data, pills, lines, "selftest-compact");
  }

  function renderInventory(data) {
    const skills = Array.isArray(data.skills) ? data.skills : [];
    const servers = Array.isArray(data.mcp_servers) ? data.mcp_servers : [];
    const firstSkills = skills.slice(0, 3).map((skill) => "skill: " + shortValue((skill?.name || "skill") + (skill?.source ? " [" + shortSource(skill.source) + "]" : "")));
    const lines = [
      "skills: " + (data.skill_count ?? skills.length),
      "mcp servers: " + (data.mcp_server_count ?? servers.length),
      "write: " + shortValue(data.write_mode || "-") + " | bash: " + shortValue(data.bash_mode || "-"),
      ...(firstSkills.length ? firstSkills : ["details: hidden"])
    ];
    return compactCard(data, pill((data.skill_count ?? skills.length) + " skills", "info") + pill((data.mcp_server_count ?? servers.length) + " MCP"), lines, "inventory-compact");
  }

  function renderWorkspaces(data) {
    const spaces = Array.isArray(data.workspaces) ? data.workspaces : [];
    const preview = spaces.slice(0, 3).map((workspace) => "ws: " + shortValue((workspace?.id || "workspace") + " — " + (workspace?.root || ""), 220));
    const lines = [
      "open workspaces: " + (data.count ?? spaces.length),
      ...(preview.length ? preview : ["no workspaces opened yet"])
    ];
    return compactCard(data, pill((data.count ?? spaces.length) + " open", "info"), lines, "workspaces-compact");
  }

  function renderServerConfig(data) {
    const blocked = Array.isArray(data.blockedGlobs) ? data.blockedGlobs : [];
    const allowed = Array.isArray(data.allowedRoots) ? data.allowedRoots : [];
    const bashSession = data.bashSessionId || data.bash_session_id || "";
    const bashSessionRequired = Boolean(data.requireBashSession || data.require_bash_session);
    const pills = [
      pill("tools " + (data.toolMode || "-"), "info"),
      pill("bash " + (data.bashMode || "-")),
      bashSession ? pill("session " + bashSession, bashSessionRequired ? "warn" : "info") : "",
      pill(data.authEnabled ? "auth on" : "auth off", data.authEnabled ? "good" : "warn")
    ].join("");
    const lines = [
      pathLine("root", data.defaultRoot || "-"),
      "url: " + shortValue((data.host || "127.0.0.1") + ":" + (data.port || "-")),
      "write: " + shortValue(data.writeMode || "-") + " | bash: " + shortValue(data.bashMode || "-"),
      "tools: " + shortValue(data.toolMode || "-") + " | session: " + shortValue(bashSession ? bashSession + (bashSessionRequired ? " required" : "") : "-"),
      "allowed roots: " + allowed.length + " | blocked: " + blocked.length
    ];
    return compactCard(data, pills, lines, "server-compact");
  }

  function renderStatus(data) {
    const files = Array.isArray(data.changed_files) ? data.changed_files : [];
    const preview = files.slice(0, 3).map((line) => "file: " + shortValue(line));
    const lines = [
      data.status_error ? "git: " + shortValue(data.status_error) : "changed files: " + files.length,
      data.status ? "raw status lines: " + countLines(data.status) : "raw status: hidden",
      ...(preview.length ? preview : ["working tree clean"])
    ];
    return compactCard(data, pill(files.length ? files.length + " changed" : "clean", files.length ? "info" : "good"), lines, "status-compact");
  }

  function renderTextSummary(data, label) {
    const files = Array.isArray(data.files) ? data.files : Array.isArray(data.ai_context_files) ? data.ai_context_files : [];
    const preview = data.preview || data.text || data.status || "";
    const fileLines = files.slice(0, 3).map((file) => pathLine("file", file));
    const lines = [
      "files: " + files.length,
      "preview lines: " + countLines(preview),
      ...(fileLines.length ? fileLines : ["content: hidden"])
    ];
    return compactCard(data, pill(files.length + " files", "info"), lines, "text-compact");
  }

  function renderGeneric(data) {
    const keys = Object.keys(data || {}).filter((key) => !key.startsWith("codexpro_"));
    const lines = [
      "structured keys: " + keys.length,
      ...keys.slice(0, 4).map((key) => key + ": " + shortValue(typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key], 220))
    ];
    return compactCard(data, pill("structured", "info"), lines, "generic-compact");
  }

  function isPlaceholderPayload(data) {
    if (!data || typeof data !== "object") return true;
    const keys = Object.keys(data);
    return !keys.length || (keys.length === 1 && data.codexpro_tool === "codexpro");
  }

  function renderPending() {
    root.innerHTML = '<article class="cpx-card">' + textBox(["waiting"]) + '</article>';
  }

  function render(data) {
    if (isPlaceholderPayload(data)) {
      renderPending();
      return;
    }
    const tool = data.codexpro_tool;
    if (tool === "server_config") {
      root.innerHTML = renderServerConfig(data);
    } else if (tool === "codexpro_self_test") {
      root.innerHTML = renderSelfTest(data);
    } else if (tool === "codexpro_inventory") {
      root.innerHTML = renderInventory(data);
    } else if (tool === "list_workspaces") {
      root.innerHTML = renderWorkspaces(data);
    } else if (tool === "open_current_workspace" || tool === "open_workspace" || tool === "workspace_snapshot") {
      root.innerHTML = renderWorkspace(data);
    } else if (tool === "git_status") {
      root.innerHTML = renderStatus(data);
    } else if (tool === "show_changes") {
      root.innerHTML = renderChanges(data);
    } else if (tool === "handoff_to_agent" || tool === "handoff_to_codex") {
      root.innerHTML = renderHandoff(data);
    } else if (tool === "write" || tool === "edit" || tool === "git_diff" || tool === "export_pro_context" || tool === "read") {
      root.innerHTML = renderFile(data);
    } else if (tool === "bash") {
      root.innerHTML = renderBash(data);
    } else if (tool === "search") {
      root.innerHTML = renderSearch(data);
    } else if (tool === "read_handoff") {
      root.innerHTML = renderTextSummary(data, "handoff");
    } else if (tool === "codex_context") {
      root.innerHTML = renderTextSummary(data, "context");
    } else {
      root.innerHTML = renderGeneric(data);
    }
  }

  render(window.openai?.toolOutput || window.openai?.toolResponseMetadata || {});

  window.addEventListener("openai:set_globals", (event) => {
    render(event.detail?.globals?.toolOutput || window.openai?.toolOutput || {});
  }, { passive: true });

  window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    const message = event.data;
    if (!message || message.jsonrpc !== "2.0") return;
    if (message.method === "ui/notifications/tool-result") {
      render(message.params?.structuredContent || {});
    }
  }, { passive: true });
</script>
`.trim();
