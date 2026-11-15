# TJC Seremban Coffee: setup guide

Waiters open the site and order. Baristas press "I'm a barista", enter a PIN, and see the orders.

You need three free accounts: **GitHub** (stores the code), **Firebase** (stores the orders), **Vercel** (hosts the website).

> **How to tell if it's working:** open your site. At the top you should see a small green **● Live**.
> If you see a red box instead, the box tells you exactly what is wrong. Match it to the Troubleshooting section at the bottom.
>
> There is no offline or demo mode: without the Firebase keys the site cannot save orders and will say so in the red box. So finish all 7 steps before using it on a Sunday.

---

## Step 1. Put the code on GitHub

1. Unzip `tjc-coffee.zip`.
2. Go to https://github.com/new, name it `tjc-coffee`, choose **Private**, click **Create repository**.
3. On the new page click **uploading an existing file**, drag in everything inside the unzipped `tjc-coffee` folder (the files, not the folder itself), then click **Commit changes**.

## Step 2. Create the Firebase project

1. Go to https://console.firebase.google.com and sign in with Google.
2. Click **Create a project** (or **Add project**). Name it `tjc-coffee`. You can turn Google Analytics **off**. Click **Create project**, then **Continue**.

## Step 3. Create the database

1. In the left menu click **Build**, then **Firestore Database**.
2. Click **Create database**.
3. Location: choose `asia-southeast1` (Singapore), click **Next**.
4. Choose **Start in production mode**, click **Create**. Wait until it finishes.

## Step 4. Publish the rules (this step is required)

Without this, Firebase refuses every order and nothing will move.

1. Still in **Firestore Database**, click the **Rules** tab at the top.
2. Select everything in the box and delete it.
3. Paste exactly this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{id} {
      allow read, write: if true;
    }
    match /config/{id} {
      allow read, write: if true;
    }
  }
}
```

4. Click **Publish**.

## Step 5. Copy your Firebase keys

1. Click the **gear icon** (top left, next to "Project Overview"), then **Project settings**.
2. Scroll down to **Your apps**. Click the **`</>`** (Web) icon.
3. App nickname: `web`. Leave "Firebase Hosting" **unticked**. Click **Register app**.
4. You will see a block of code with `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`. Keep this page open. You will copy these 6 values next.

## Step 6. Deploy on Vercel and add the keys

1. Go to https://vercel.com and sign in with GitHub.
2. Click **Add New...**, then **Project**. Find `tjc-coffee` and click **Import**.
3. Before clicking Deploy, open **Environment Variables** and add these 7 rows (type the Name exactly, paste the Value from Step 5, no quote marks):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | the `apiKey` value |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | the `authDomain` value |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | the `projectId` value |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | the `storageBucket` value |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | the `messagingSenderId` value |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | the `appId` value |
| `NEXT_PUBLIC_BARISTA_PIN` | a PIN you choose, e.g. `4821` |

4. Click **Deploy**.

**Already deployed without the keys?** Keys are only picked up when the site is built. So after adding them:
Vercel project, **Deployments** tab, click the **...** on the top deployment, **Redeploy**, then **Redeploy** again to confirm.

## Step 7. Test it

1. Open your site on your phone. You should see **● Live** at the top.
2. Open `your-site/barista` on a laptop or another phone and enter your PIN.
3. Send an order from the phone. It should appear on the barista screen within a second or two.
4. In Firebase, **Firestore Database**, **Data** tab: an `orders` collection should now exist.

---

## Every Sunday

1. Barista: **Floor map**, tap on empty space to add numbered tables to match today's seating, then **Save map**.
2. Waiters refresh their page and see the map.
3. After service: **History**, **Download CSV**, then **End session**.

## Troubleshooting

| What you see | What to do |
|---|---|
| Red box: **Firebase keys are missing** | The keys aren't in Vercel. Redo Step 6 (add all 7 variables, then **Redeploy** — adding them without redeploying does nothing). |
| Red box: **Firestore rules are blocking access** | Redo Step 4 and make sure you clicked **Publish**. |
| Red box: **database has not been created** | Redo Step 3. |
| Red box: **Could not send** on the waiter screen | The phone lost internet, or the rules aren't published (Step 4). |
| Green **● Live** but nothing shows in Firebase **Data** | Check the project name at the top left is the right one, and refresh the Data tab. |
| Forgot the PIN | Vercel, **Settings**, **Environment Variables**, edit `NEXT_PUBLIC_BARISTA_PIN`, then Redeploy. |

## Security note

The barista PIN is checked inside the browser, and the database rules above are open (waiters have no login). That is fine for a coffee corner, but it is not real security. Do not store anything sensitive.

## Developers

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase keys
npm run dev
```

Stack: Next.js (App Router) + Firestore. The cinematic background is a small WebGL shader in `components/Ambient.tsx`; it pauses when the tab is hidden and shows a still frame when the device asks for reduced motion.
