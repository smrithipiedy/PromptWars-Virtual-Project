/**
 * Tests for the rate-limiting utility.
 */
import { checkRateLimit } from "@/lib/api/rate-limit";

describe("checkRateLimit", () => {
  it("allows the first request from any IP", () => {
    const result = checkRateLimit("1.2.3.4", 5000);
    expect(result).toBe(true);
  });

  it("blocks requests within the cooldown window", () => {
    const ip = "5.6.7.8";
    checkRateLimit(ip, 60000); // first call
    const blocked = checkRateLimit(ip, 60000); // immediate second call
    expect(blocked).toBe(false);
  });

  it("allows requests from different IPs independently", () => {
    const r1 = checkRateLimit("10.0.0.1", 5000);
    const r2 = checkRateLimit("10.0.0.2", 5000);
    expect(r1).toBe(true);
    expect(r2).toBe(true);
  });
});
