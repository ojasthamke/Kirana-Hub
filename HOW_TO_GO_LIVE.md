# 🚀 How to Make Kirana Hub Live (Step-by-Step)

Follow these steps to deploy your B2B Marketplace to the internet.

## Phase 1: Setup Database (MongoDB Atlas)
Since your app uses MongoDB, you need a live database.
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Create a new Project and a **Free Cluster** (Shared).
3. Under **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
4. Under **Database Access**, create a user with a password.
5. Click **Connect** → **Drivers** → Copy the Connection String (SRV).
   * It looks like: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/kirana_hub?retryWrites=true&w=majority`

## Phase 2: Prepare for Deployment (Vercel)
Vercel is the best and easiest way to host Next.js apps for free.
1. Push your code to a **GitHub Repository**.
2. Go to [Vercel](https://vercel.com/) and sign up with GitHub.
3. Click "Add New" → "Project" → "Import" your repository.
4. **Environment Variables**: This is the most important part!
   Add these variables in the "Environment Variables" section on Vercel:
   * `MONGODB_URI`: (Your copied MongoDB SRV string)
   * `JWT_SECRET`: (Create a random long string, e.g., `kirana_hub_secure_2026_!@#`)
   * `NODE_ENV`: `production`

5. Click **Deploy**.

## Phase 3: Final Verification
Once deployed, Vercel will give you a live URL (e.g., `kirana-hub.vercel.app`).
1. Visit the URL.
2. Go to `/login` and try to sign up or log in.
3. Check your MongoDB Atlas collection to see if the data is being saved.

---

### Tips for Success
* **Mobile Friendly**: The UI is already built for mobile, so your shop owners can order directly from their phones.
* **Security**: Never share your `.env` file publicly.
* **Custom Domain**: You can add your own domain (e.g., `www.kiranahub.com`) later in Vercel settings under "Domains".
