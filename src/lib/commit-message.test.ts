import { describe, expect, it } from "vitest";
import { checkMessage } from "../../scripts/check-commit-message.mjs";

describe("commit messages", () => {
  it.each([
    "feat: add the commit message check",
    "fix(chat): keep the draft when the reply fails",
    "refactor!: drop the old triage route",
    "chore: merge pull request #9 from chore/general-test-audit",
    "feat: add login\n\nA body is free text, with Capitals and tildes: canción.",
  ])("accept %j", (message) => {
    expect(checkMessage(message)).toEqual([]);
  });

  it("asks for a conventional commit type", () => {
    expect(checkMessage("add the check")).toHaveLength(1);
    expect(checkMessage("update: add the check")).toHaveLength(1);
    expect(checkMessage("feat:add the check")).toHaveLength(1);
    expect(checkMessage("Merge pull request #9 from a/b").length).toBeGreaterThan(0);
  });

  it("asks for lowercase", () => {
    expect(checkMessage("feat: add Login")).toEqual(["write the subject in lowercase only"]);
    expect(checkMessage("Feat: add login").length).toBeGreaterThan(0);
  });

  it("rejects emoji codes, emoji and accents", () => {
    expect(checkMessage("docs: :memo: document the check")).toEqual(["leave out emoji codes such as :memo: or :sparkles:"]);
    expect(checkMessage("feat: add login 🚀")).toEqual(["use plain ascii: no emoji, accents or other symbols"]);
    expect(checkMessage("docs: actualiza la documentación")).toEqual(["use plain ascii: no emoji, accents or other symbols"]);
  });

  it("rejects an empty message and a very long subject", () => {
    expect(checkMessage("")).toEqual(["the message is empty"]);
    expect(checkMessage("  \n\n")).toEqual(["the message is empty"]);
    expect(checkMessage(`feat: ${"a".repeat(100)}`)).toHaveLength(1);
  });

  it("rejects a co-author trailer for an ai assistant, but not for a person", () => {
    const trailer = "feat: add login\n\nCo-Authored-By: Claude <noreply@anthropic.com>";
    expect(checkMessage(trailer)).toEqual(["remove the co-authored-by trailer for an ai assistant"]);
    expect(checkMessage("feat: add login\n\nCo-Authored-By: Ana <ana@example.com>")).toEqual([]);
  });

  it("lets a fixup commit through only when it is asked to", () => {
    expect(checkMessage("fixup! feat: add login")).not.toEqual([]);
    expect(checkMessage("fixup! feat: add login", { allowTemporary: true })).toEqual([]);
  });

  it("reads windows line endings", () => {
    expect(checkMessage("feat: add login\r\n\r\nbody")).toEqual([]);
  });
});
