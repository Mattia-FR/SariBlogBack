import { describe, it, expect, vi, beforeEach } from "vitest";

// Comme la fonction dépend de process.env, j’utilise vi.resetModules() et un import dynamique dans chaque test
// pour pouvoir modifier la variable d’environnement avant l’import, et ainsi simuler différents cas.
describe("buildImageUrl", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  // Je teste les cas limites : null, undefined, chaîne vide.
  // La fonction ne doit pas planter et retourner undefined.
  it("retourne undefined si path est null/undefined/empty", async () => {
    process.env.IMAGE_BASE_URL = "http://localhost:4242";
    const { buildImageUrl } = await import("../../src/utils/imageUrl");

    expect(buildImageUrl(null)).toBeUndefined();
    expect(buildImageUrl(undefined)).toBeUndefined();
    expect(buildImageUrl("")).toBeUndefined();
  });

  // Je vérifie que la fonction supprime le slash en trop quand la base se termine déjà par /
  // et que le chemin commence par /.
  it("gère le double slash (base avec / final, path avec / initial)", async () => {
    process.env.IMAGE_BASE_URL = "http://localhost:4242/";
    const { buildImageUrl } = await import("../../src/utils/imageUrl");

    expect(buildImageUrl("/uploads/images/photo.jpg")).toBe(
      "http://localhost:4242/uploads/images/photo.jpg",
    );
  });

  // Ici je teste le cas où il manque un slash : la fonction doit le rajouter pour construire une URL correcte.
  it("ajoute le slash au path si nécessaire (path sans / initial)", async () => {
    process.env.IMAGE_BASE_URL = "https://cdn.example.com";
    const { buildImageUrl } = await import("../../src/utils/imageUrl");

    expect(buildImageUrl("uploads/images/photo.jpg")).toBe(
      "https://cdn.example.com/uploads/images/photo.jpg",
    );
  });
});
