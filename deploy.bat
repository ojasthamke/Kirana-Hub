@echo off
cd /d "%~dp0"
echo Setting environment variables...
call vercel env add MONGODB_URI production "mongodb+srv://ojasthamke3_db_user:Lubdhat%401@ac-c0fpphq.jrz6hcp.mongodb.net/kirana_hub?retryWrites=true&w=majority"
call vercel env add JWT_SECRET production "kirana_hub_secure_session_key_2026_!@#"
call vercel env add LOCAL_MODE production false
call vercel env add NEXT_PUBLIC_LOCAL_MODE production false
echo.
echo Deploying to Vercel...
call vercel --prod --yes
