import { describe, it, expect } from "vitest";
import { buildSlug } from "../../src/utils/slug";

describe("buildSlug", () => {
  // Je définis un tableau de cas de test : chaque entrée a une chaîne d'entrée
  // et le slug attendu. Cela me permet d'itérer dessus et d'éviter la répétition.
  const cases: Array<{ input: string; expected: string }> = [
    // Cas nominal : texte classique → minuscules, espaces remplacés par des tirets
    { input: "Mon premier article", expected: "mon-premier-article" },
    // Accents : les caractères accentués sont supprimés (remplacés par leur équivalent non accentué)
    { input: "Été à la plage", expected: "ete-a-la-plage" },
    // Ponctuation : les points d'exclamation sont supprimés
    { input: "Hello World!!!", expected: "hello-world" },
    // Chaîne vide : on retourne une chaîne vide (pas de slug)
    { input: "", expected: "" },
    // Chaîne déjà en slug : doit rester identique (idempotence implicite)
    { input: "déjà-un-slug", expected: "deja-un-slug" },
    // Espaces multiples au début et à la fin : doivent être nettoyés
    { input: "  espaces   autour  ", expected: "espaces-autour" },
    // Double tiret : doit être normalisé en un seul tiret
    { input: "article--double--tiret", expected: "article-double-tiret" },
  ];

  // Pour chaque cas, je génère un test avec un nom explicite.
  // Ainsi, si un test échoue, je vois tout de suite quel cas a posé problème.
  for (const { input, expected } of cases) {
    it(`convertit "${input}" en "${expected}"`, () => {
      // Act & Assert : j'appelle la fonction avec l'entrée et je compare au résultat attendu
      expect(buildSlug(input)).toBe(expected);
    });
  }

  // Un test supplémentaire pour insister sur l'idempotence :
  // un slug déjà propre ne doit pas être modifié par un second appel.
  it("est idempotent sur un slug déjà formé", () => {
    expect(buildSlug("deja-un-slug")).toBe("deja-un-slug");
  });
});