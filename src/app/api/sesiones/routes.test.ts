import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const closeOtherSessions = vi.fn();
const closeSession = vi.fn();
const reportError = vi.fn();

vi.mock("@/lib/session", () => ({ getSession: () => getSession() }));
vi.mock("@/lib/profile-db", () => ({
  closeOtherSessions: (...args: unknown[]) => closeOtherSessions(...args),
  closeSession: (...args: unknown[]) => closeSession(...args),
}));
vi.mock("@/lib/error-report", () => ({ reportError: (...args: unknown[]) => reportError(...args) }));

import { DELETE as closeOthers } from "@/app/api/sesiones/route";
import { DELETE as closeOne } from "@/app/api/sesiones/[id]/route";

beforeEach(() => {
  getSession.mockReset().mockResolvedValue({ id: "persona-1", sid: "sid-current" });
  closeOtherSessions.mockReset().mockResolvedValue(2);
  closeSession.mockReset().mockResolvedValue(true);
  reportError.mockReset();
});

describe("revocación de sesiones", () => {
  it("requires authentication and closes only other devices", async () => {
    getSession.mockResolvedValue(null);
    expect((await closeOthers()).status).toBe(401);
    expect((await closeOne(new Request("http://localhost"), { params: Promise.resolve({ id: "sid-other" }) })).status).toBe(401);
    expect(closeOtherSessions).not.toHaveBeenCalled();
    expect(closeSession).not.toHaveBeenCalled();

    getSession.mockResolvedValue({ id: "persona-1", sid: "sid-current" });
    expect(await (await closeOthers()).json()).toEqual({ ok: true, closed: 2 });
    expect(closeOtherSessions).toHaveBeenCalledWith("persona-1", "sid-current");
  });

  it("rejects the current or malformed session identifiers before database access", async () => {
    const current = await closeOne(new Request("http://localhost"), { params: Promise.resolve({ id: "sid-current" }) });
    expect(current.status).toBe(400);
    expect(await current.json()).toEqual({ error: "current" });

    const malformed = await closeOne(new Request("http://localhost"), { params: Promise.resolve({ id: "not-a-uuid" }) });
    expect(malformed.status).toBe(400);
    expect(await malformed.json()).toEqual({ error: "invalid" });
    expect(closeSession).not.toHaveBeenCalled();
  });

  it("closes a well-formed other session and distinguishes missing rows", async () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    expect(await (await closeOne(new Request("http://localhost"), { params: Promise.resolve({ id }) })).json()).toEqual({ ok: true });
    expect(closeSession).toHaveBeenCalledWith("persona-1", id);

    closeSession.mockResolvedValue(false);
    const missing = await closeOne(new Request("http://localhost"), { params: Promise.resolve({ id }) });
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ error: "not_found" });
  });

  it("converts persistence failures to a safe server error", async () => {
    closeOtherSessions.mockRejectedValue(new Error("database unavailable"));
    const response = await closeOthers();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "server" });
    expect(reportError).toHaveBeenCalledWith("api/sesiones", expect.any(Error));
  });
});
