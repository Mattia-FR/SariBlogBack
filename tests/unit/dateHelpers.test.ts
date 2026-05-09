import { describe, it, expect } from "vitest";
import { toDateString } from "../../src/utils/dateHelpers";

describe("toDateString", () => {
  // La fonction retourne null pour toute entrée invalide ou vide.
  // Cela évite d'avoir des dates "undefined" ou "null" qui traînent dans l'affichage.

  it("retourne null pour undefined", () => {
    // On force l'appel avec undefined pour tester la robustesse.
    // Normalement TypeScript empêcherait ce cas, mais en test on vérifie que la fonction
    // le gère quand même (par ex. si l'input vient d'une API mal typée).
    expect(toDateString(undefined as unknown as Date | string | null)).toBe(null);
  });

  it("retourne null pour null", () => {
    // Cas explicite : null → null. Comportement attendu pour une valeur absente.
    expect(toDateString(null)).toBe(null);
  });

  it("retourne null pour chaine vide", () => {
    // Une chaîne vide n'est pas une date valide, donc on veut null.
    expect(toDateString("")).toBe(null);
  });

  it("convertit une Date en ISO string", () => {
    // On crée une date précise et on vérifie le format ISO complet (avec millisecondes).
    // Cela garantit que la fonction utilise bien toISOString() ou équivalent.
    const d = new Date("2025-06-15T12:00:00Z");
    expect(toDateString(d)).toBe("2025-06-15T12:00:00.000Z");
  });

  it("conserve une string non vide (pas de validation)", () => {
    // Si on passe déjà une chaîne non vide, la fonction la retourne telle quelle.
    // Elle ne vérifie pas si c'est une date valide, c'est volontaire (par exemple,
    // on peut avoir des dates déjà formatées en "YYYY-MM-DD").
    expect(toDateString("2025-06-15")).toBe("2025-06-15");
    // Même une chaîne quelconque est conservée (comportement assumé).
    expect(toDateString("hello")).toBe("hello");
  });
});
