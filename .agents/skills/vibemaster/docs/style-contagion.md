---
summary: 'Skill text is the style prompt: agents imitate the register of the texts they are steeped in, so cleaning jargon out of a skill body beats bolting on any "write plainly" instruction'
read_when:
  - Writing or revising any skill body
  - Diagnosing why an agent talks in jargon
---

# Skill text is the style prompt

An agent that spends all day steeped in skill texts starts talking like them. We learned this the concrete way: an agent working in this repo began minting jargon in its own replies (transliterating terms from English source material into loan-word nouns, coining compact labels without explaining them) until its summaries needed a decoder. The instructions never told it to do that. The surrounding text did.

## The mechanism

Language models are style continuators. Whatever prose occupies the context window becomes the register model for the output. A skill body is injected into context when the skill runs, which means **every skill you ship is also an implicit style prompt**, whether you meant it or not.

Instructions tell the model what to do. The prose around them shows it how to talk. When the two disagree (a "write plainly" instruction bolted onto a body full of coined vocabulary), showing beats telling, because the body outweighs the instruction by volume.

## What this means for skill authors

- **Write the body in the register you want the agent to speak.** The body is not just a procedure. It is a writing sample the model will imitate.
- **A coined term in a skill body will be repeated by the agent.** If you must coin a label, put its explanation in the same sentence, then the agent repeats the explanation along with the term, and readers survive.
- **Describe foreign concepts, don't transliterate them.** A pet noun minted from another language or ecosystem gets cloned by the agent without the context that made it legible. Say what the thing does in your own words.
- **Cleaning the body beats adding an instruction.** If an agent talks in jargon, the fix is rarely one more rule. Audit the texts it marinates in.

## Enforcing it

Style discipline decays without a ratchet. Ours has two layers:

- **Judgment layer**: a model audit pass over product texts: it finds what a script cannot, like an unexplained metaphor or a process trace leaking into product copy.
- **Mechanical layer**: a banned-term list plus punctuation checks in a script, wired into CI. Every term an audit purges gets appended to the list, so it can never return.

The same shape (a written discipline for the model, a mechanical gate against slips) now guards three things in this stack: expression style, manifest consistency, and the privacy rules of the publish step. Judgment finds, scripts keep.

The drop-in rule that states the discipline itself lives in [rules/plain-language.md](../rules/plain-language.md).
