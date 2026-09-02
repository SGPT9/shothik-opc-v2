"""Structural contract for the four-skill stack.

Pins invariants (what must exist, what must agree, what must be gone),
never prose. Skill wording is free to evolve; these tests only break when
the stack's shape breaks: a skill dir appears or vanishes, a manifest
drifts from the skills on disk, a doc routes to a dead skill, or the
bilingual twins fall out of sync where they must agree.
"""

import json
import pathlib
import re
import unittest


ROOT = pathlib.Path(__file__).resolve().parent.parent

SKILLS = ("shaping", "coding", "dig", "snapshot")

# Retired skill names. Docs and manifests must not route to them.
LEGACY = (
    "spec-out",
    "deep-thought",
    "muse",
    "socrates",
    "clarify",
    "figure-out",
    "test-first",
    "best-practices",
)

MANIFESTS = (
    ".claude-plugin/marketplace.json",
    ".agents/plugins/marketplace.json",
)

DOCS = (
    "README.md",
    "README.zh-CN.md",
    "AGENTS.md",
    "docs/philosophy.md",
    "docs/philosophy.zh-CN.md",
)

CJK = re.compile(r"[一-鿿]")


def frontmatter_field(text, field):
    match = re.search(rf"^{field}:\s*(.+)$", text, re.MULTILINE)
    return match.group(1).strip() if match else None


class SkillLayoutTest(unittest.TestCase):
    def test_skills_dir_holds_exactly_the_four(self):
        dirs = {p.name for p in (ROOT / "skills").iterdir() if p.is_dir()}
        self.assertEqual(dirs, set(SKILLS))

    def test_every_skill_has_bilingual_twins(self):
        for skill in SKILLS:
            base = ROOT / "skills" / skill
            self.assertTrue((base / "SKILL.md").is_file(), skill)
            self.assertTrue((base / "SKILL.zh-CN.md").is_file(), skill)

    def test_twins_share_name_and_description(self):
        for skill in SKILLS:
            base = ROOT / "skills" / skill
            en = (base / "SKILL.md").read_text()
            zh = (base / "SKILL.zh-CN.md").read_text()
            for field in ("name", "description"):
                self.assertEqual(
                    frontmatter_field(en, field),
                    frontmatter_field(zh, field),
                    f"{skill}: {field} differs between twins",
                )

    def test_zh_twin_links_to_the_authoritative_english(self):
        for skill in SKILLS:
            zh = (ROOT / "skills" / skill / "SKILL.zh-CN.md").read_text()
            self.assertIn("(./SKILL.md)", zh, skill)

    def test_every_description_has_an_exclusion_clause(self):
        for skill in SKILLS:
            en = (ROOT / "skills" / skill / "SKILL.md").read_text()
            description = frontmatter_field(en, "description")
            self.assertIn("Do not trigger", description, skill)

    def test_referenced_reference_files_exist_with_twins(self):
        for skill in SKILLS:
            base = ROOT / "skills" / skill
            text = (base / "SKILL.md").read_text()
            for name in set(re.findall(r"references/([a-z-]+\.md)", text)):
                ref = base / "references" / name
                self.assertTrue(ref.is_file(), f"{skill}: missing {name}")
                zh_twin = base / "references" / name.replace(".md", ".zh-CN.md")
                self.assertTrue(zh_twin.is_file(), f"{skill}: missing zh twin of {name}")


class DeliverableContractTest(unittest.TestCase):
    def test_shaping_delivers_spec_and_design_under_issues(self):
        text = (ROOT / "skills" / "shaping" / "SKILL.md").read_text()
        self.assertIn("spec.md", text)
        self.assertIn("design.md", text)
        self.assertIn(".issues/", text)

    def test_dig_delivers_issue_md_under_issues(self):
        text = (ROOT / "skills" / "dig" / "SKILL.md").read_text()
        self.assertIn("issue.md", text)
        self.assertIn(".issues/", text)


class ManifestContractTest(unittest.TestCase):
    def test_manifests_publish_bundle_plus_the_four(self):
        for relative in MANIFESTS:
            manifest = json.loads((ROOT / relative).read_text())
            names = {plugin["name"] for plugin in manifest["plugins"]}
            self.assertEqual(names, {"vibemaster", *SKILLS}, relative)

    def test_manifests_agree_with_each_other(self):
        first, second = (
            json.loads((ROOT / relative).read_text()) for relative in MANIFESTS
        )
        self.assertEqual(first, second)

    def test_manifest_skill_paths_exist(self):
        for relative in MANIFESTS:
            manifest = json.loads((ROOT / relative).read_text())
            for plugin in manifest["plugins"]:
                for skill_path in plugin.get("skills", ()):
                    self.assertTrue(
                        (ROOT / skill_path).is_dir(),
                        f"{relative}: {plugin['name']} points at {skill_path}",
                    )

    def test_manifest_descriptions_are_english(self):
        for relative in MANIFESTS:
            manifest = json.loads((ROOT / relative).read_text())
            texts = [manifest["metadata"]["description"]]
            texts += [plugin["description"] for plugin in manifest["plugins"]]
            for text in texts:
                self.assertIsNone(CJK.search(text), f"{relative}: {text}")


class DocRoutingTest(unittest.TestCase):
    def test_docs_do_not_route_to_legacy_skills(self):
        for relative in DOCS:
            text = (ROOT / relative).read_text()
            for legacy in LEGACY:
                self.assertNotIn(f"`{legacy}`", text, f"{relative} routes to {legacy}")
                self.assertNotIn(f"skills/{legacy}", text, f"{relative} routes to {legacy}")

    def test_skill_paths_mentioned_in_docs_exist(self):
        for relative in DOCS:
            text = (ROOT / relative).read_text()
            for name in set(re.findall(r"skills/([a-z-]+)", text)):
                self.assertTrue(
                    (ROOT / "skills" / name).is_dir(),
                    f"{relative} mentions skills/{name}, which does not exist",
                )

    def test_readmes_cover_every_skill(self):
        for relative in ("README.md", "README.zh-CN.md"):
            text = (ROOT / relative).read_text()
            for skill in SKILLS:
                self.assertIn(f"`{skill}`", text, f"{relative} misses {skill}")


class EvalLayoutTest(unittest.TestCase):
    def test_eval_dirs_match_current_skills(self):
        dirs = {p.name for p in (ROOT / "evals").iterdir() if p.is_dir()}
        self.assertEqual(dirs, set(SKILLS))


if __name__ == "__main__":
    unittest.main()
