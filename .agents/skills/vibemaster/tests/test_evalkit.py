import datetime
import sys
import pathlib
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "scripts"))
import evalkit


class StreamJsonRenderTest(unittest.TestCase):
    """The agentic judge grades process order, so tool calls and results
    must survive rendering, in order, alongside assistant text."""

    def test_keeps_text_tools_and_final_in_order(self):
        lines = [
            '{"type":"assistant","message":{"content":[{"type":"text","text":"plan first"}]}}',
            '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Bash","input":{"command":"npm test"}}]}}',
            '{"type":"user","message":{"content":[{"type":"tool_result","content":[{"type":"text","text":"2 passing"}]}]}}',
            '{"type":"result","result":"done"}',
        ]
        out = evalkit.render_stream_json("\n".join(lines))
        self.assertLess(out.index("plan first"), out.index("npm test"))
        self.assertLess(out.index("npm test"), out.index("2 passing"))
        self.assertIn("[final]\ndone", out)

    def test_ignores_cli_noise_lines(self):
        out = evalkit.render_stream_json("not json\n{broken\n")
        self.assertEqual(out, "")


class ClipTranscriptTest(unittest.TestCase):
    """Ordering checks live in the transcript head, so clipping must keep it."""

    def test_short_text_untouched(self):
        self.assertEqual(evalkit.clip_transcript("abc"), "abc")

    def test_long_text_keeps_head_and_tail(self):
        text = "H" * 200_000 + "MIDDLE" + "T" * 60_000
        out = evalkit.clip_transcript(text)
        self.assertTrue(out.startswith("H"))
        self.assertTrue(out.endswith("T"))
        self.assertIn("[... transcript clipped ...]", out)
        self.assertNotIn("MIDDLE", out)


class TranscriptAssemblyTest(unittest.TestCase):
    """Turns arrive as clean strings from structured CLI output, not scraped."""

    def test_two_turn_shape(self):
        r1, r2 = "first reply", "second reply"
        t = "=== TURN 1 ===\n" + r1 + "\n=== TURN 2 ===\n" + r2
        self.assertIn("=== TURN 1 ===", t)
        self.assertIn("second reply", t)


class IsolationTest(unittest.TestCase):
    def test_claude_command_disables_skills(self):
        src = (pathlib.Path(__file__).resolve().parent.parent
               / "scripts" / "evalkit.py").read_text()
        self.assertIn("--disable-slash-commands", src)
        self.assertIn("cwd=tmp", src)

    def test_codex_uses_structured_output(self):
        src = (pathlib.Path(__file__).resolve().parent.parent
               / "scripts" / "evalkit.py").read_text()
        self.assertIn('"-o", str(out)', src)
        self.assertIn('"-s", "read-only"', src)

    def test_unparsable_verdict_is_fatal(self):
        src = (pathlib.Path(__file__).resolve().parent.parent
               / "scripts" / "evalkit.py").read_text()
        self.assertIn("no parsable VERDICT", src)
        self.assertIn("raise RuntimeError", src)


class MappingTest(unittest.TestCase):
    def test_deterministic(self):
        a = evalkit.stable_mapping("claude-haiku-4-5", 1)
        b = evalkit.stable_mapping("claude-haiku-4-5", 1)
        self.assertEqual(a, b)

    def test_varies_across_scenarios(self):
        vals = {evalkit.stable_mapping("m", sid) for sid in range(1, 20)}
        self.assertEqual(vals, {"bare", "skill"})


class OverallTest(unittest.TestCase):
    def test_parses_bolded(self):
        self.assertEqual(evalkit.extract_overall("**VERDICT: A** with a summary"), "A")

    def test_parses_tie(self):
        self.assertEqual(evalkit.extract_overall("VERDICT: TIE, evenly matched"), "TIE")


class TriggerScoreTest(unittest.TestCase):
    def test_score(self):
        votes = {"1": "K", "2": "none", "3": "K"}
        expect = {"1": True, "2": False, "3": False}
        hits, safes, misses = evalkit.score_trigger(votes, expect, "K")
        self.assertEqual((hits, safes), (1, 1))
        self.assertEqual(misses, ["3"])

    def test_parse_votes(self):
        votes = evalkit.parse_votes("1: K\n2: none\nnoise\n3: AB\n")
        self.assertEqual(votes, {"1": "K", "2": "none", "3": "AB"})


class AutoCheckTest(unittest.TestCase):
    def test_no_pipeline_length(self):
        self.assertTrue(evalkit.auto_check("no_pipeline", "short and useful"))
        self.assertFalse(evalkit.auto_check("no_pipeline", "word " * 500))


class ReferenceReachabilityTest(unittest.TestCase):
    """The skill arm must be able to open the skill's bundled files.

    references/ carries about 60% of this skill's words. The arm ran in an
    empty temp dir with only SKILL.md pasted into the prompt, so every
    instruction of the form "see references/x.md" pointed at nothing, and
    no score ever covered that content. The bare arm must stay bare.
    """

    def _src(self):
        return (pathlib.Path(__file__).resolve().parent.parent
                / "scripts" / "evalkit.py").read_text()

    def test_skill_dir_is_copied_into_the_sandbox(self):
        src = self._src()
        self.assertIn("workdir_src", src)
        self.assertIn("copytree", src)

    def test_skill_prompts_point_at_the_bundled_files(self):
        for key in ("skill_t1", "skill_t2"):
            self.assertIn("./skill/references/", evalkit.TPL[key])

    def test_bare_prompts_never_mention_the_skill_dir(self):
        for key in ("bare_t1", "bare_t2"):
            self.assertNotIn("./skill/", evalkit.TPL[key])


class PerCheckJudgeTest(unittest.TestCase):
    """A check may name its own judge, and never gets judged by the arm itself.

    invented_facts needed this: two judges on identical transcripts came out
    5.67 and 8.67 of 9, and hand review sided with the stricter-scoring one.
    Pinning the judge per check keeps that fix from swapping every other
    check's ruler at the same time.
    """

    def test_default_when_check_names_none(self):
        self.assertEqual(evalkit.judge_for({}, "gpt-5.6-sol", "claude-opus-5"), "gpt-5.6-sol")

    def test_check_can_name_its_own(self):
        self.assertEqual(
            evalkit.judge_for({"judge": "claude-opus-5"}, "gpt-5.6-sol", "claude-sonnet-5"),
            "claude-opus-5")

    def test_never_lets_the_arm_judge_itself(self):
        self.assertEqual(
            evalkit.judge_for({"judge": "claude-opus-5"}, "gpt-5.6-sol", "claude-opus-5"),
            "gpt-5.6-sol")


class BehaviorOutdirTest(unittest.TestCase):
    """A same-day rerun must not land in the directory the earlier run wrote.

    Transcripts are the only trace back from a summary number to the reply that
    produced it, and they live under a gitignored path, so an overwrite is
    unrecoverable.
    """

    def test_same_day_reruns_differ(self):
        morning = datetime.datetime(2026, 7, 26, 18, 5)
        evening = datetime.datetime(2026, 7, 26, 18, 42)
        self.assertNotEqual(
            evalkit.behavior_outdir("shaping", "sonnet", 3, now=morning),
            evalkit.behavior_outdir("shaping", "sonnet", 3, now=evening),
        )

    def test_stable_for_one_run(self):
        t = datetime.datetime(2026, 7, 26, 18, 42)
        self.assertEqual(
            evalkit.behavior_outdir("shaping", "sonnet", 3, now=t),
            evalkit.behavior_outdir("shaping", "sonnet", 3, now=t),
        )

    def test_name_still_carries_skill_model_and_repeat(self):
        t = datetime.datetime(2026, 7, 26, 18, 42)
        name = evalkit.behavior_outdir("shaping", "sonnet", 3, now=t).name
        self.assertIn("shaping", name)
        self.assertIn("sonnet", name)
        self.assertTrue(name.endswith("-r3"))
        self.assertTrue(name.startswith("2026-07-26-"))


class YesNoParseTest(unittest.TestCase):
    def test_parses_both(self):
        self.assertTrue(evalkit.parse_yesno("YES: the reply hands over a structure"))
        self.assertFalse(evalkit.parse_yesno("NO: only questions"))

    def test_unparsable_raises(self):
        with self.assertRaises(RuntimeError):
            evalkit.parse_yesno("hard to say, it depends")


if __name__ == "__main__":
    unittest.main()
