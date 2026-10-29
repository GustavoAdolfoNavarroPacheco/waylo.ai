import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const getIpsPatient = vi.fn();
const getIpsAppointments = vi.fn();
const reportError = vi.fn();

vi.mock("@/lib/session", () => ({ getSession: () => getSession() }));
vi.mock("@/lib/error-report", () => ({ reportError: (...args: unknown[]) => reportError(...args) }));
vi.mock("@/lib/ips-backend", () => ({
  getIpsPatient: (...args: unknown[]) => getIpsPatient(...args),
  getIpsAppointments: (...args: unknown[]) => getIpsAppointments(...args),
  IpsBackendError: class IpsBackendError extends Error {
    constructor(readonly code: string, readonly status: number, message: string) {
      super(message);
    }
  },
}));

import { GET as getPatient } from "@/app/api/ips/patient/route";
import { GET as getAppointments } from "@/app/api/ips/appointments/route";
import { IpsBackendError } from "@/lib/ips-backend";

beforeEach(() => {
  getSession.mockReset().mockResolvedValue({ id: "persona-1" });
  getIpsPatient.mockReset().mockResolvedValue({ patientId: 42, name: "Ana" });
  getIpsAppointments.mockReset().mockResolvedValue([{ id: "apt-1", status: "confirmed" }]);
  reportError.mockReset();
});

describe("lecturas server-side de IPS", () => {
  it("requires a Waylo session and never queries institutional data for guests", async () => {
    getSession.mockResolvedValue(null);

    expect((await getPatient()).status).toBe(401);
    expect((await getAppointments()).status).toBe(401);
    expect(getIpsPatient).not.toHaveBeenCalled();
    expect(getIpsAppointments).not.toHaveBeenCalled();
  });

  it("reads patient and appointments for the current session with no-store caching", async () => {
    const patient = await getPatient();
    const appointments = await getAppointments();

    expect(await patient.json()).toEqual({ patientId: 42, name: "Ana" });
    expect(await appointments.json()).toEqual([{ id: "apt-1", status: "confirmed" }]);
    expect(patient.headers.get("cache-control")).toBe("no-store");
    expect(appointments.headers.get("cache-control")).toBe("no-store");
    expect(getIpsPatient).toHaveBeenCalledWith("persona-1");
    expect(getIpsAppointments).toHaveBeenCalledWith("persona-1");
  });

  it("preserves typed backend errors without reporting expected link absence", async () => {
    getIpsAppointments.mockRejectedValue(new IpsBackendError("NO_ACTIVE_LINK", 409, "Sin vínculo"));

    const response = await getAppointments();

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "NO_ACTIVE_LINK", message: "Sin vínculo" });
    expect(reportError).not.toHaveBeenCalled();
  });

  it("reports outages and returns a safe response without exposing provider details", async () => {
    getIpsPatient.mockRejectedValue(new IpsBackendError("IPS_UNAVAILABLE", 503, "detalle interno"));

    const response = await getPatient();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "IPS_UNAVAILABLE", message: "detalle interno" });
    expect(reportError).toHaveBeenCalledWith("api/ips/patient", expect.any(Error));
  });
});
