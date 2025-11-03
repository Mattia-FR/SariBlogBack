// Charger les variables d'environnement depuis le fichier .env
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';

dotenv.config();

// Construire le chemin vers le fichier SQL de la base de données
const schema = path.join(__dirname, 'database.sql');

// Récupérer les détails de connexion à la base de données depuis le fichier .env
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Validation des variables d'environnement
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.error('❌ Missing required database environment variables');
    process.exit(1);
}

// Validation du nom de la base de données (sécurité)
const isValidDbName = /^[a-zA-Z0-9_]+$/.test(DB_NAME);
if (!isValidDbName) {
    console.error('❌ Invalid database name format. Only alphanumeric characters and underscores are allowed.');
    process.exit(1);
}

const migrate = async (): Promise<void> => {
    let database: mysql.Connection | null = null;

    try {
        console.log('🔄 Starting database migration...');

        // Lire les instructions SQL depuis le fichier database.sql
        const sql = fs.readFileSync(schema, 'utf8');

        // Créer une connexion spécifique à la base de données
        database = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT ? parseInt(DB_PORT, 10) : 3306,
            user: DB_USER,
            password: DB_PASSWORD,
            multipleStatements: true, // Permettre plusieurs instructions SQL
        });

        console.log('📡 Connected to MySQL server');

        // Avertissement avant DROP en développement
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`⚠️  About to DROP database '${DB_NAME}' if it exists!`);
        }

        // Supprimer la base de données existante si elle existe
        console.log(`🗑️  Dropping database '${DB_NAME}' if it exists...`);
        await database.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);

        // Créer une nouvelle base de données avec le nom spécifié
        console.log(`🆕 Creating database '${DB_NAME}'...`);
        await database.query(`CREATE DATABASE \`${DB_NAME}\``);

        // Basculer vers la base de données nouvellement créée
        console.log(`🔄 Switching to database '${DB_NAME}'...`);
        await database.query(`USE \`${DB_NAME}\``);

        // Exécuter les instructions SQL pour mettre à jour le schéma de la base de données
        console.log('⚙️ Executing schema and data...');
        try {
            await database.query(sql);
        } catch (sqlErr) {
            // Afficher plus de détails sur les erreurs SQL
            if (sqlErr instanceof Error && 'code' in sqlErr) {
                console.error('SQL Error code:', (sqlErr as any).code);
                console.error('SQL Error number:', (sqlErr as any).errno);
                if ((sqlErr as any).sqlMessage) {
                    console.error('SQL Error message:', (sqlErr as any).sqlMessage);
                }
            }
            throw sqlErr;
        }

        console.log(
            `✅ Database '${DB_NAME}' successfully migrated from '${path.normalize(schema)}' 🆙`
        );
    } catch (err) {
        console.error('❌ Error updating the database:', err instanceof Error ? err.message : err);
        
        // Afficher les détails de l'erreur SQL si disponibles
        if (err instanceof Error && 'code' in err) {
            console.error('SQL Error code:', (err as any).code);
            if ((err as any).sqlMessage) {
                console.error('SQL Error message:', (err as any).sqlMessage);
            }
        }
        
        if (err instanceof Error && err.stack) {
            console.error('Stack trace:', err.stack);
        }
        process.exit(1);
    } finally {
        // Fermer la connexion à la base de données dans tous les cas
        if (database) {
            await database.end();
        }
    }
};

// Exécuter la fonction de migration
migrate();

