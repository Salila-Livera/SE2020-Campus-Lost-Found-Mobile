========================================================
CampusFind - Campus Lost & Found System
========================================================

Author: Salila
Module: Web and Mobile Technologies Final Project
Phase: 8 (Final Setup)

========================================================
1. TECH STACK & SYSTEM OVERVIEW
========================================================
- Frontend: React Native (Expo), React Navigation, Axios, expo-image-picker
- Backend: Node.js, Express.js (CommonJS), JSON Web Tokens (JWT)
- Database: MongoDB Atlas (via Mongoose)
- Image Storage: Cloudinary (Images are uploaded via memory storage, not disk)
- Hosting: Vercel (Backend API)

========================================================
2. FOLDER STRUCTURE
========================================================
/backend   - Express REST API source code
/frontend  - React Native (Expo) source code

========================================================
3. LOCAL SETUP INSTRUCTIONS
========================================================
To run this project on your local machine, follow these steps:

A. Backend Setup
----------------
1. Open a terminal and navigate to the backend folder:
   cd backend
2. Install dependencies:
   npm install
3. Create the environment file:
   Rename `.env.example` to `.env`
4. Fill in the required credentials in `.env`:
   - MONGODB_URI: Your MongoDB Atlas connection string.
   - JWT_SECRET: A strong random string for signing tokens.
   - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name.
   - CLOUDINARY_API_KEY: Your Cloudinary API key.
   - CLOUDINARY_API_SECRET: Your Cloudinary API secret.
5. Start the backend server:
   npm run dev
   (The server should run on http://localhost:5000)

B. Frontend Setup
-----------------
1. Open a new terminal and navigate to the frontend folder:
   cd frontend
2. Install dependencies:
   npm install
3. Configure the API URL:
   Open `src/config.js`. If you are testing on an Android Emulator, the default 
   http://10.0.2.2:5000/api will work. If testing on a physical device via Expo Go,
   replace it with your computer's local IP address (e.g., http://192.168.x.x:5000/api).
4. Start the Expo app:
   npx expo start
5. Press "a" to open the Android emulator, or scan the QR code with the Expo Go app.

========================================================
4. BUSINESS RULES & KEY FEATURES IMPLEMENTED
========================================================
As per the assignment requirements:
1. Users cannot claim their own items.
2. Claims are only allowed on items with itemType "Found" and status "Open".
3. A user cannot claim the same item twice.
4. Only one claim can be approved per item.
5. Approving a claim automatically rejects all other pending claims and sets the item to "Returned".
6. A "Returned" item accepts no new claims.
7. Images are securely hosted on Cloudinary without local disk dependency.
8. Authentication uses JWT, passwords are encrypted via bcrypt, Auth context is preserved via SecureStore.
9. Full Item CRUD and full Claim logic.

========================================================
5. DEPLOYMENT (Vercel)
========================================================
The API is currently configured for local development. To deploy:
1. Push this repository to GitHub.
2. Link the repository to a new Web Service on Vercel.
3. Ensure the Root Directory is set to `backend`.
4. Copy all keys from the `.env` file into Vercel's Environment Variables menu.
5. Deploy.
6. Once deployed, update `API_BASE_URL` in `frontend/src/config.js` to match your new Vercel URL.
