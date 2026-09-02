#!/usr/bin/env python3
"""evalkit: runnable eval machinery for the stack.

Subcommands:
  duel           run a bare-vs-skill duel matrix for one model
  trigger-judge  run the judged trigger eval for one skill

Everything is stdlib-only and CLI-driven. Arms and judges run over
`claude -p` / `codex exec` child processes, never in-session subagents
(session env can silently remap subagent models).
"""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import random
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent

TPL = {
 "bare_t1": """You are a general-purpose AI assistant. Respond the way you normally would, in the language the user writes in.

The user says: "{t1}"

Write your reply. Output only the reply text.""",
 "bare_t2": """You are a general-purpose AI assistant. Respond the way you normally would, in the language the user writes in.

Earlier in this conversation the user said: "{t1}"

You replied:
{r1}

Now the user says: "{t2}"

Write your reply. Output only the reply text.""",
 "skill_t1": """You are an AI assistant with the following skill installed, and this conversation follows the skill strictly. Respond in the language the user writes in.

<skill>
{skill}
</skill>

The skill's own files sit in ./skill/ in your working directory, including ./skill/references/. When the skill above points you at one, open it.

The user says: "{t1}"

Write your reply. Output only the reply text.""",
 "skill_t2": """You are an AI assistant with the following skill installed, and this conversation follows the skill strictly. Respond in the language the user writes in.

<skill>
{skill}
</skill>

The skill's own files sit in ./skill/ in your working directory, including ./skill/references/. When the skill above points you at one, open it.

Earlier in this conversation the user said: "{t1}"

You replied:
{r1}

Now the user says: "{t2}"

Write your reply. Output only the reply text.""",
 "judge": """You are a conversation-quality judge. The same user talked to two different assistants for two turns each. Turn one the user said: "{t1}" Turn two: "{t2}"

Compare the two transcripts on the criteria below. For each criterion, answer A, B, or TIE with a one-line reason. End with a line starting exactly "VERDICT: A", "VERDICT: B", or "VERDICT: TIE", plus one summary sentence.

Criteria:
{criteria}

[Transcript A]
{jia}

[Transcript B]
{yi}""",
}

ROUTER_TPL = """You are the skill router of an agent harness. Below is the list of installed skills (code letters and descriptions only), then a batch of user queries.
For each query, judge from the descriptions alone: which skill triggers? If no description matches, answer none. When unsure, prefer none.
Output results only, one line per query, formatted "N: LETTER" or "N: none". No explanations.

## Skills

{listing}

## Queries

{queries}"""


def run_model(model, prompt, timeout=900, workdir_src=None):
    """Run one prompt on one model, isolated, returning only the model's reply.

    Isolation matters: without it an arm inherits the repo's AGENTS.md, the
    user's globally installed skills, and prior context, so a "bare" arm is
    not bare. Both CLIs run from an empty temp dir, Claude with skills
    disabled, Codex read-only with its reply written to a file rather than
    scraped out of the transcript.
    """
    with tempfile.TemporaryDirectory() as tmp:
        if workdir_src:
            shutil.copytree(workdir_src, pathlib.Path(tmp) / "skill")
        if model.startswith(("claude", "haiku", "sonnet", "opus")):
            cmd = ["claude", "-p", prompt, "--model", model,
                   "--disable-slash-commands"]
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout,
                               stdin=subprocess.DEVNULL, cwd=tmp)
            if r.returncode != 0:
                raise RuntimeError(f"{model} failed: {(r.stderr or r.stdout)[:200]}")
            return r.stdout.strip()
        if model.startswith("gpt"):
            out = pathlib.Path(tmp) / "reply.txt"
            cmd = ["codex", "exec", "-C", tmp, "--skip-git-repo-check",
                   "-s", "read-only", "-o", str(out), "-m", model]
            if model.startswith("gpt-5.5"):
                cmd += ["-c", 'model_reasoning_effort="xhigh"']
            cmd.append(prompt)
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout,
                               stdin=subprocess.DEVNULL, cwd=tmp)
            if not out.is_file():
                raise RuntimeError(f"{model} wrote no reply: {(r.stderr or r.stdout)[:200]}")
            return out.read_text().strip()
    raise SystemExit(f"unknown model family for {model}")


def extract_transcript(raw):
    """Last === TURN 1 === block, stripped of CLI noise. None if absent."""
    idx = raw.rfind("=== TURN 1 ===")
    if idx < 0:
        return None
    text = raw[idx:].strip()
    text = re.sub(r"\n(tokens used|\d{4}-\d{2}-\d{2}T\S*).*$", "", text, flags=re.S)
    text = re.sub(r"^Warning: no stdin.*\n", "", text)
    return text.strip()


def stable_mapping(model, sid):
    """Deterministic 甲/乙 assignment per (model, scenario) so reruns reproduce."""
    h = hashlib.sha256(f"{model}:{sid}".encode()).digest()[0]
    return "skill" if h % 2 else "bare"


def extract_overall(verdict_text):
    m = re.search(r"VERDICT[:：]\s*[*\s]*(A|B|TIE)\b", verdict_text)
    return m.group(1) if m else None


def cmd_duel(args):
    skill = args.skill
    model = args.model
    duel = json.loads((ROOT / "evals" / skill / args.fixture).read_text())
    skill_text = (ROOT / "skills" / skill / "SKILL.md").read_text()
    scenarios = [s for s in duel["scenarios"]
                 if not args.scenarios or str(s["id"]) in args.scenarios.split(",")]
    stamp = datetime.date.today().isoformat()
    tag = args.fixture.replace("-eval.json", "")
    outdir = ROOT / ".issues" / "duels" / f"{stamp}-{skill}-{tag}-{model}"
    outdir.mkdir(parents=True, exist_ok=True)

    def run_arm(s, arm):
        turns = s["turns"]
        t1 = turns[0]
        src = ROOT / "skills" / skill if arm == "skill" else None
        r1 = run_model(model, TPL[f"{arm}_t1"].format(skill=skill_text, t1=t1),
                       workdir_src=src)
        if len(turns) == 1:
            t = f"=== TURN 1 ===\n{r1}"
        else:
            r2 = run_model(model, TPL[f"{arm}_t2"].format(
                skill=skill_text, t1=t1, r1=r1, t2=turns[1]), workdir_src=src)
            t = f"=== TURN 1 ===\n{r1}\n=== TURN 2 ===\n{r2}"
        (outdir / f"s{s['id']}-{arm}.md").write_text(t)
        return s["id"], arm, t

    texts = {}
    if args.judge_only:
        for s in scenarios:
            for arm in ("bare", "skill"):
                f = outdir / f"s{s['id']}-{arm}.md"
                if not f.is_file():
                    raise SystemExit(f"--judge-only needs existing transcripts, missing {f}")
                texts[(s["id"], arm)] = f.read_text()
        print(f"reusing {len(texts)} transcripts from {outdir}")
    else:
        jobs = [(s, arm) for s in scenarios for arm in ("bare", "skill")]
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.parallel) as ex:
            for sid, arm, t in ex.map(lambda j: run_arm(*j), jobs):
                texts[(sid, arm)] = t
        print(f"arms done: {len(jobs)} transcripts -> {outdir}")

    mapping, results = {}, {}

    def run_judge(s):
        sid = s["id"]
        jia = stable_mapping(model, sid)
        yi = "bare" if jia == "skill" else "skill"
        mapping[str(sid)] = {"A": jia, "B": yi}
        turns = s["turns"]
        t1 = turns[0]
        t2 = turns[1] if len(turns) > 1 else "(single turn)"
        crit = "\n".join(f"{i+1}. {c}" for i, c in enumerate(s["criteria"]))
        prompt = TPL["judge"].format(t1=t1, t2=t2, criteria=crit,
                                     jia=texts[(sid, jia)], yi=texts[(sid, yi)])
        raw = run_model(args.judge_model, prompt)
        (outdir / f"verdict-s{sid}.txt").write_text(raw)
        overall = extract_overall(raw)
        if overall is None:
            raise RuntimeError(f"s{sid}: judge returned no parsable VERDICT: {raw.strip()[:150]}")
        winner = None
        if overall == "A":
            winner = jia
        elif overall == "B":
            winner = yi
        elif overall == "TIE":
            winner = "tie"
        results[str(sid)] = {"overall": overall, "winner": winner}
        return sid

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.parallel) as ex:
        list(ex.map(run_judge, scenarios))

    summary = {"date": stamp, "skill": skill, "arms_model": model,
               "judge_model": args.judge_model, "mapping": mapping,
               "results": results,
               "skill_wins": sum(1 for r in results.values() if r["winner"] == "skill")}
    (outdir / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2))
    print(json.dumps(summary, ensure_ascii=False, indent=2))


def build_router_prompt(skills_dirs, fixture, seed):
    descs = {}
    for d in skills_dirs:
        for sk in sorted(pathlib.Path(d).iterdir()):
            f = sk / "SKILL.md"
            if f.is_file():
                m = re.search(r"^description:\s*(.+)$", f.read_text(), re.M)
                if m:
                    descs[sk.name] = m.group(1).strip()
    names = sorted(descs)
    rng = random.Random(seed)
    shuffled = names[:]
    rng.shuffle(shuffled)
    letters = [chr(65 + i) for i in range(len(shuffled))]
    mapping = dict(zip(letters, shuffled))
    cases = fixture["cases"]
    order = list(range(len(cases)))
    rng.shuffle(order)
    listing = "\n".join(f"- {L}: {descs[mapping[L]]}" for L in letters)
    queries = "\n".join(f"{i}. {cases[idx]['query']}" for i, idx in enumerate(order, 1))
    expect = {str(i): cases[idx]["should_trigger"] for i, idx in enumerate(order, 1)}
    qtext = {str(i): cases[idx]["query"] for i, idx in enumerate(order, 1)}
    return ROUTER_TPL.format(listing=listing, queries=queries), mapping, expect, qtext


def score_trigger(votes, expect, target_letter):
    hits = safes = 0
    misses = []
    for n, exp in expect.items():
        v = votes.get(n)
        if exp and v == target_letter:
            hits += 1
        elif not exp and v != target_letter:
            safes += 1
        else:
            misses.append(n)
    return hits, safes, misses


def parse_votes(raw):
    return dict(re.findall(r"^(\d+): (\w+|none)$", raw, re.M))


def cmd_trigger_judge(args):
    skill = args.skill
    fixture = json.loads((ROOT / "evals" / skill / "trigger-eval.json").read_text())
    dirs = [ROOT / "skills"]
    for extra in args.extra_skills:
        dirs.append(pathlib.Path(extra))
    prompt, mapping, expect, qtext = build_router_prompt(dirs, fixture, args.seed)
    target = next(L for L, n in mapping.items() if n == skill)
    print(f"{len(mapping)} skills in listing, {skill} = {target}, judge = {args.judge_model}")
    raw = run_model(args.judge_model, prompt)
    votes = parse_votes(raw)
    hits, safes, misses = score_trigger(votes, expect, target)
    n_pos = sum(1 for v in expect.values() if v)
    n_neg = len(expect) - n_pos
    print(f"应触发 {hits}/{n_pos}, 不应触发安全 {safes}/{n_neg}")
    for n in misses:
        print(f"  MISS #{n} 「{qtext[n]}」 -> {mapping.get(votes.get(n, 'none'), votes.get(n))}")
    sys.exit(0 if not misses else 1)


CHECK_TPL = """You are checking one property of an assistant reply. Answer with exactly one word, YES or NO, then a colon and a short reason.

The user said: "{turn}"

The check: {question}

[Reply]
{reply}"""


def judge_for(check, default, arm_model):
    """Which model judges this check.

    A check may pin its own judge when the default disagrees with hand review.
    It never gets to judge the arm it is scoring, so a pinned judge that
    matches the arm falls back to the default.
    """
    named = check.get("judge") or default
    return default if named == arm_model else named


def auto_check(check_id, reply):
    """Programmatic checks. Returns True when the reply passes."""
    if check_id == "no_pipeline":
        words = len(re.findall(r"[A-Za-z']+", reply)) + len(re.findall(r"[\u4e00-\u9fff]", reply)) // 2
        return words < 450
    raise SystemExit(f"no auto rule for {check_id}")


def parse_yesno(raw):
    m = re.search(r"\b(YES|NO)\b", raw.upper())
    if not m:
        raise RuntimeError(f"judge gave no YES/NO: {raw.strip()[:120]}")
    return m.group(1) == "YES"


def behavior_outdir(skill, model, repeat, now=None):
    """Where one behavior run writes, down to the minute.

    Transcripts are the only way back from a summary number to the reply that
    produced it, and they sit under a gitignored path with no other copy. A
    day-level name silently overwrites the morning's run with the evening's.
    """
    now = now or datetime.datetime.now()
    return (ROOT / ".issues" / "behavior"
            / f"{now:%Y-%m-%d-%H%M}-{skill}-{model}-r{repeat}")


def cmd_behavior(args):
    skill = args.skill
    model = args.model
    spec = json.loads((ROOT / "evals" / skill / "behavior-eval.json").read_text())
    scen_file = json.loads((ROOT / "evals" / skill / args.scenario_fixture).read_text())
    skill_text = (ROOT / "skills" / skill / "SKILL.md").read_text()
    scenarios = [s for s in scen_file["scenarios"]
                 if not args.scenarios or str(s["id"]) in args.scenarios.split(",")]
    stamp = datetime.date.today().isoformat()
    outdir = behavior_outdir(skill, model, args.repeat)
    outdir.mkdir(parents=True, exist_ok=True)

    def one_run(rep, s):
        turn = s["turns"][0]
        reply = run_model(model, TPL["skill_t1"].format(skill=skill_text, t1=turn),
                          workdir_src=ROOT / "skills" / skill)
        (outdir / f"rep{rep}-s{s['id']}.md").write_text(reply)
        row = {}
        for c in spec["checks"]:
            if c.get("auto"):
                passed = auto_check(c["id"], reply)
            else:
                raw = run_model(judge_for(c, args.judge_model, model),
                                CHECK_TPL.format(turn=turn, question=c["q"], reply=reply))
                got = parse_yesno(raw)
                passed = (not got) if c.get("invert") else got
            row[c["id"]] = passed
        return rep, s["id"], row

    jobs = [(rep, s) for rep in range(1, args.repeat + 1) for s in scenarios]
    rows = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.parallel) as ex:
        for rep, sid, row in ex.map(lambda j: one_run(*j), jobs):
            rows[(rep, sid)] = row

    per_check = {}
    for c in spec["checks"]:
        cid = c["id"]
        by_rep = [sum(1 for s in scenarios if rows[(rep, s["id"])][cid])
                  for rep in range(1, args.repeat + 1)]
        per_check[cid] = {"per_repeat_passes": by_rep, "of": len(scenarios),
                          "spread": max(by_rep) - min(by_rep)}
    summary = {"date": stamp, "skill": skill, "model": model, "judge_model": args.judge_model,
               "repeats": args.repeat, "scenarios": [s["id"] for s in scenarios],
               "per_check": per_check,
               "rows": {f"rep{r}-s{sid}": v for (r, sid), v in rows.items()}}
    (outdir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
    for cid, v in per_check.items():
        print(f"{cid:18} passes {v['per_repeat_passes']} of {v['of']}  noise spread {v['spread']}")
    print(f"-> {outdir}")


AGENTIC_TPL = """You are a coding agent working in this directory, with the following skill installed. This conversation follows the skill strictly. Respond in the language the user writes in.

<skill>
{skill}
</skill>

The skill's own files (including references/) sit in ./skill/. When the skill points you at one, open it.

Stay inside the current directory: wherever the task says 临时目录 or asks you to create a working directory, use ./work under the current directory, never the system /tmp.

The user's task:

{prompt}"""

AGENTIC_CHECK_TPL = """You are grading one property of a coding agent's work session. Answer with exactly one word, YES or NO, then a colon and a short reason citing evidence from the transcript or workspace state.

The agent's task was:
{prompt}

The property to check: {question}

[Session transcript]
{transcript}

[Workspace state after the session]
{state}"""


def render_stream_json(raw):
    """Readable transcript from `claude -p --output-format stream-json` output.

    Keeps assistant text, tool calls with inputs, and tool results, because
    the expectations judge ordering and process, not just the final message.
    Non-JSON lines pass through untouched.
    """
    out = []
    for line in raw.splitlines():
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            continue
        msg = ev.get("message") or {}
        for block in msg.get("content") or []:
            kind = block.get("type")
            if kind == "text" and block.get("text"):
                out.append(f"[assistant]\n{block['text']}")
            elif kind == "tool_use":
                arg = json.dumps(block.get("input", {}), ensure_ascii=False)
                out.append(f"[tool_use {block.get('name')}] {arg[:2000]}")
            elif kind == "tool_result":
                content = block.get("content")
                if isinstance(content, list):
                    content = "".join(c.get("text", "") for c in content
                                      if isinstance(c, dict))
                out.append(f"[tool_result] {str(content)[:2000]}")
        if ev.get("type") == "result" and ev.get("result"):
            out.append(f"[final]\n{ev['result']}")
    return "\n\n".join(out)


def run_agent(model, prompt, workdir, timeout=1800):
    """Run one agentic arm with tools enabled inside workdir, return transcript."""
    if model.startswith(("claude", "sonnet", "opus")):
        cmd = ["claude", "-p", prompt, "--model", model,
               "--dangerously-skip-permissions",
               "--output-format", "stream-json", "--verbose"]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout,
                           stdin=subprocess.DEVNULL, cwd=workdir)
        if r.returncode != 0 and not r.stdout:
            raise RuntimeError(f"{model} failed: {(r.stderr or '')[:300]}")
        return render_stream_json(r.stdout)
    if model.startswith("gpt"):
        cmd = ["codex", "exec", "-C", str(workdir), "--skip-git-repo-check",
               "-s", "workspace-write", "-m", model]
        if model.startswith("gpt-5.5"):
            cmd += ["-c", 'model_reasoning_effort="xhigh"']
        cmd.append(prompt)
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout,
                           stdin=subprocess.DEVNULL, cwd=workdir)
        if not (r.stdout or r.stderr):
            raise RuntimeError(f"{model} wrote nothing")
        # codex streams the session log (commands, outputs) to stderr and the
        # final message to stdout: the judge needs both.
        return f"{r.stderr}\n\n[final]\n{r.stdout}".strip()
    raise SystemExit(f"unknown model family for {model}")


def workspace_state(workspace):
    """Post-run evidence the transcript can't show: files, key drafts, git."""
    ws = pathlib.Path(workspace)
    lines = ["## Files"]
    skip = {".git", "node_modules", "skill"}
    for p in sorted(ws.rglob("*")):
        if p.is_file() and not (skip & set(p.parts)):
            lines.append(str(p.relative_to(ws)))
    for name in ("snapshot.md", "issue.md", "spec.md", "design.md"):
        for f in sorted(ws.rglob(name)):
            if skip & set(f.parts):
                continue
            lines.append(f"\n## {f.relative_to(ws)}\n{f.read_text()[:4000]}")
    for git_dir in sorted(ws.rglob(".git")):
        repo = git_dir.parent
        try:
            status = subprocess.run(["git", "status", "--short"], cwd=repo,
                                    capture_output=True, text=True, timeout=30).stdout
            log = subprocess.run(["git", "log", "--oneline", "-5"], cwd=repo,
                                 capture_output=True, text=True, timeout=30).stdout
            ignore = subprocess.run(["git", "check-ignore", ".issues"], cwd=repo,
                                    capture_output=True, text=True, timeout=30)
            lines.append(f"\n## git @ {repo.relative_to(ws)}\nstatus:\n{status}"
                         f"log:\n{log}check-ignore .issues: exit {ignore.returncode}")
        except Exception as e:  # noqa: BLE001 - evidence gathering must not kill the run
            lines.append(f"\n## git @ {repo.relative_to(ws)}: {e}")
    return "\n".join(lines)[:20000]


def clip_transcript(text, head=150_000, tail=50_000):
    """Judging input keeps the head: ordering checks (red before green,
    reproduce before attribute) live in the early transcript, so a
    tail-only cut systematically fails exactly those expectations."""
    if len(text) <= head + tail:
        return text
    return f"{text[:head]}\n\n[... transcript clipped ...]\n\n{text[-tail:]}"


def cmd_agentic(args):
    skill = args.skill
    model = args.model
    spec = json.loads((ROOT / "evals" / skill / "evals.json").read_text())
    skill_text = (ROOT / "skills" / skill / "SKILL.md").read_text()
    evals = [e for e in spec["evals"]
             if not args.evals or str(e["id"]) in args.evals.split(",")]
    if args.judge_only:
        outdir = pathlib.Path(args.outdir)
        if not outdir.is_dir():
            raise SystemExit(f"--judge-only needs an existing run dir, not {outdir}")
    else:
        outdir = behavior_outdir(skill, model, 1)
        outdir.mkdir(parents=True, exist_ok=True)

    def one_eval(e):
        if args.judge_only:
            transcript = (outdir / f"e{e['id']}-transcript.md").read_text()
            state = (outdir / f"e{e['id']}-state.md").read_text()
        else:
            # The workspace must live outside this repo's tree: a CLI arm
            # walks up from cwd and would otherwise inherit vibemaster's
            # CLAUDE.md, AGENTS.md, and project memory. One arm answered a
            # fixture's design question from that memory before this moved.
            ws = pathlib.Path(tempfile.mkdtemp(prefix=f"evalkit-{skill}-e{e['id']}-"))
            shutil.copytree(ROOT / "skills" / skill, ws / "skill", dirs_exist_ok=True)
            for f in e.get("files", []):
                dst = ws / f
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(ROOT / f, dst)
            prompt = AGENTIC_TPL.format(skill=skill_text, prompt=e["prompt"])
            try:
                transcript = run_agent(model, prompt, ws)
                (outdir / f"e{e['id']}-transcript.md").write_text(transcript)
                state = workspace_state(ws)
                (outdir / f"e{e['id']}-state.md").write_text(state)
                archive = outdir / f"e{e['id']}-workspace"
                if archive.exists():
                    shutil.rmtree(archive)
                shutil.copytree(ws, archive, symlinks=True)
            finally:
                shutil.rmtree(ws, ignore_errors=True)
        verdicts = []
        for i, q in enumerate(e["expectations"], 1):
            raw = run_model(args.judge_model, AGENTIC_CHECK_TPL.format(
                prompt=e["prompt"][:2000], question=q,
                transcript=clip_transcript(transcript), state=state))
            verdicts.append({"n": i, "q": q, "passed": parse_yesno(raw),
                             "why": raw.strip()[:300]})
        return e["id"], verdicts

    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.parallel) as ex:
        for eid, verdicts in ex.map(one_eval, evals):
            results[str(eid)] = verdicts

    summary = {"date": datetime.date.today().isoformat(), "skill": skill,
               "model": model, "judge_model": args.judge_model,
               "results": results,
               "passed": sum(v["passed"] for vs in results.values() for v in vs),
               "of": sum(len(vs) for vs in results.values())}
    (outdir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
    for eid, vs in sorted(results.items()):
        marks = "".join("✓" if v["passed"] else "✗" for v in vs)
        print(f"e{eid}: {marks}")
        for v in vs:
            if not v["passed"]:
                print(f"   ✗ #{v['n']} {v['q'][:70]}")
    print(f"{summary['passed']}/{summary['of']} -> {outdir}")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    d = sub.add_parser("duel")
    d.add_argument("--skill", required=True)
    d.add_argument("--model", required=True)
    d.add_argument("--scenarios", default="")
    d.add_argument("--fixture", default="duel-eval.json")
    d.add_argument("--judge-only", action="store_true",
                   help="reuse transcripts already in the output dir, run judging only")
    d.add_argument("--judge-model", default="claude-fable-5")
    d.add_argument("--parallel", type=int, default=4)
    d.set_defaults(func=cmd_duel)
    t = sub.add_parser("trigger-judge")
    t.add_argument("--skill", required=True)
    t.add_argument("--seed", type=int, default=20260726)
    t.add_argument("--judge-model", default="claude-fable-5")
    t.add_argument("--extra-skills", nargs="*", default=["../opcstack/skills"])
    t.set_defaults(func=cmd_trigger_judge)
    b = sub.add_parser("behavior")
    b.add_argument("--skill", required=True)
    b.add_argument("--model", required=True)
    b.add_argument("--scenarios", default="")
    b.add_argument("--scenario-fixture", default="routing-eval.json")
    b.add_argument("--repeat", type=int, default=1)
    b.add_argument("--judge-model", default="claude-fable-5")
    b.add_argument("--parallel", type=int, default=4)
    b.set_defaults(func=cmd_behavior)
    a = sub.add_parser("agentic",
                       help="run evals.json fixtures with a tool-enabled arm in an isolated workspace")
    a.add_argument("--skill", required=True)
    a.add_argument("--model", required=True)
    a.add_argument("--evals", default="")
    a.add_argument("--judge-model", default="gpt-5.6-sol")
    a.add_argument("--judge-only", action="store_true",
                   help="re-judge an existing run dir without re-running arms")
    a.add_argument("--outdir", default="",
                   help="existing run dir, required with --judge-only")
    a.add_argument("--parallel", type=int, default=2)
    a.set_defaults(func=cmd_agentic)
    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
