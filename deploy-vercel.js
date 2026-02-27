const { execSync } = require('child_process');

const envs = {
    MONGODB_URI: 'mongodb+srv://ojasthamke3_db_user:Lubdhat%401@ac-c0fpphq.jrz6hcp.mongodb.net/kirana_hub?retryWrites=true&w=majority',
    JWT_SECRET: 'kirana_hub_secure_session_key_2026_!@#',
    LOCAL_MODE: 'false',
    NEXT_PUBLIC_LOCAL_MODE: 'false'
};

for (const [key, value] of Object.entries(envs)) {
    console.log(`Setting ${key}...`);
    try {
        // We use echo n to answer "Mark as sensitive? no" if prompted, although passing value as argument usually works
        // But the vercel CLI behavior varies. Let's try passing it directly first.
        execSync(`vercel env add ${key} production "${value.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Failed to set ${key}: ${e.message}`);
    }
}

console.log('Deploying...');
execSync('vercel --prod --yes', { stdio: 'inherit' });
