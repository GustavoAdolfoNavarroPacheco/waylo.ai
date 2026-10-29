import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("hash de contraseñas", () => {
  it("round-trips the password without storing it in clear text", async () => {
    const password = "Clave segura 123!";
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^scrypt\$[^$]+\$[^$]+$/);
    expect(hash).not.toContain(password);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("otra contraseña", hash)).resolves.toBe(false);
  });

  it("uses a fresh salt and rejects malformed or truncated hashes", async () => {
    const first = await hashPassword("misma contraseña");
    const second = await hashPassword("misma contraseña");

    expect(first).not.toBe(second);
    await expect(verifyPassword("x", "plain-text")).resolves.toBe(false);
    await expect(verifyPassword("x", "scrypt$$invalid")).resolves.toBe(false);
    await expect(verifyPassword("x", "scrypt$not-base64$short")).resolves.toBe(false);
  });
});
