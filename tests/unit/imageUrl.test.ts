import { describe, it, expect, vi, beforeEach } from "vitest";

describe("buildImageUrl", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("retourne undefined si path est null/undefined/empty", async () => {
    process.env.IMAGE_BASE_URL = "http://localhost:4242";
    const { buildImageUrl } = await import("../../src/utils/imageUrl");

    expect(buildImageUrl(null)).toBeUndefined();
    expect(buildImageUrl(undefined)).toBeUndefined();
    expect(buildImageUrl("")).toBeUndefined();
  });

  it("gère le double slash (base avec / final, path avec / initial)", async () => {
    process.env.IMAGE_BASE_URL = "http://localhost:4242/";
    const { buildImageUrl } = await import("../../src/utils/imageUrl");

    expect(buildImageUrl("/uploads/images/photo.jpg")).toBe(
      "http://localhost:4242/uploads/images/photo.jpg",
    );
  });

  it("ajoute le slash au path si nécessaire (path sans / initial)", async () => {
    process.env.IMAGE_BASE_URL = "https://cdn.example.com";
    const { buildImageUrl } = await import("../../src/utils/imageUrl");

    expect(buildImageUrl("uploads/images/photo.jpg")).toBe(
      "https://cdn.example.com/uploads/images/photo.jpg",
    );
  });
});
