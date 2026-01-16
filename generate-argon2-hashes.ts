import argon2 from 'argon2';
import { argon2Options } from './src/config/argon2';

async function generateHashes() {
    const users = [
        'admin',
        'sari.elliot',
        'marie.dubois',
        'pierre.martin',
        'sophie.bernard',
        'lucas.roux',
        'emma.lucas'
    ];
    
    const passwords = [
        'Reve42',
        'Serenite26',
        'Aventure54',
        'Equilibre10',
        'Lueur29',
        'Echo77',
        'Infini00'
    ];
    
    console.log('Génération des hashs Argon2 pour chaque utilisateur...\n');
    
    try {
        for (let i = 0; i < users.length; i++) {
            const username = users[i];
            const password = passwords[i];
            const hash = await argon2.hash(password, argon2Options);
            
            console.log(`${username}: ${hash}`);
        }
        
        console.log('\n---');
        console.log('Hashs générés ! Vous pouvez maintenant les copier dans database.seed.sql');
        console.log('Dans le même ordre que les utilisateurs.');
        
    } catch (error) {
        console.error('Erreur lors de la génération des hashs :', error);
        process.exit(1);
    }
}

generateHashes();

