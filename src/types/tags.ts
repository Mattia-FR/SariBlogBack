import type { RowDataPacket } from "mysql2/promise";

// Interface représentant une ligne brute de la table tags en base de données.
// Extends RowDataPacket pour être compatible avec mysql2/promise.
export interface TagRow extends RowDataPacket {
    id: number;
    name: string;
    slug: string;
    created_at: Date;
}

// Interface pour un tag individuel.
export interface Tag extends TagRow {}