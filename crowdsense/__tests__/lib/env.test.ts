import { validateEnv } from "@/lib/env";

describe("Env Validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return validated env when all keys are present", () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "dummy-key";
    process.env.GEMINI_API_KEY = "dummy-gemini";
    
    const result = validateEnv();
    expect(result.GEMINI_API_KEY).toBe("dummy-gemini");
  });

  it("should log error if keys are missing (in prod/test mode)", () => {
    // Mock console.error
    const spy = jest.spyOn(console, 'error').mockImplementation();
    
    delete process.env.GEMINI_API_KEY;
    
    validateEnv();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
