import { describe, it, expect } from "vitest";
import {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../src/utils/jwtHelpers.js";

describe("jwtHelpers", () => {
  it("round-trips an access token payload", () => {
    const token = generateToken({ id: 1, email: "a@b.com" });
    const decoded = verifyToken(token);
    expect(decoded).toMatchObject({ id: 1, email: "a@b.com" });
  });

  it("round-trips a refresh token payload", () => {
    const token = generateRefreshToken({ id: 2, email: "c@d.com" });
    const decoded = verifyRefreshToken(token);
    expect(decoded).toMatchObject({ id: 2, email: "c@d.com" });
  });

  it("returns null for an invalid access token", () => {
    expect(verifyToken("not.a.jwt")).toBeNull();
  });

  it("does not verify an access token with the refresh secret", () => {
    const access = generateToken({ id: 3, email: "e@f.com" });
    expect(verifyRefreshToken(access)).toBeNull();
  });
});
