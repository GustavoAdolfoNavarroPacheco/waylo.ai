import { describe, expect, it } from "vitest";
import { headingOf, shortestTurn } from "./angle";

describe("shortestTurn", () => {
  it("turns the short way across the 0 / 360 seam", () => {
    expect(shortestTurn(350, 10)).toBe(20);
    expect(shortestTurn(10, 350)).toBe(-20);
  });

  it("keeps a small turn as it is", () => {
    expect(shortestTurn(0, 45)).toBe(45);
    expect(shortestTurn(90, 45)).toBe(-45);
  });

  it("never asks for more than half a turn", () => {
    for (let from = -720; from <= 720; from += 37) {
      for (let to = -720; to <= 720; to += 41) {
        const turn = shortestTurn(from, to);
        expect(Math.abs(turn)).toBeLessThanOrEqual(180);
        expect((((from + turn - to) % 360) + 360) % 360).toBeCloseTo(0, 6);
      }
    }
  });
});

describe("headingOf", () => {
  it("points up for a movement up, right for a movement right", () => {
    expect(headingOf(0, -1)).toBeCloseTo(0);
    expect(headingOf(1, 0)).toBeCloseTo(90);
    expect(headingOf(0, 1)).toBeCloseTo(180);
  });
});
