import argon2 from "argon2";

/**
 * Options de hashage Argon2 conformes aux recommandations OWASP
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
export const argon2Options = {
    type: argon2.argon2id,        // Version la plus sécurisée (hybride)
    memoryCost: 19 * 2 ** 10,      // 19 MB de RAM (19 * 1024 = 19,456 KB)
    timeCost: 2,                   // 2 itérations
    parallelism: 1,                 // 1 thread
};