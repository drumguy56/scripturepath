# ScripturePath mobile app: plan

Goal: a native React Native app (Expo) for iOS and Android, published to the App Store and Google Play. Bundle ID `com.scripturepath.app`, name "ScripturePath".

## What gets built

New folder `mobile/` in this repo (Expo SDK, TypeScript, expo-router). It talks to the same backend as the web app, `https://scripturepathstudio.com/api`. No server changes are planned, apart from one possible mobile sign-in endpoint (see Auth).

Screens, mirroring the web app's routes (about 1,970 lines of page code, plus about 1,240 lines of group components):

| Web route | Mobile screen | Notes |
|---|---|---|
| /login, /register, /forgot-password, /reset-password | Auth stack | Same Neon Auth accounts |
| / | Home | Verse of the day, continue study, weather card |
| /read | Bible reader | Book and chapter pickers, translation switch (KJV, NIV, NLT, ESV, and others) |
| /library | Library | Study list |
| /study/:id, /study/:id/lesson/:id | Study detail, Lesson | Lesson content and progress |
| /journal | Journal | Create and list entries |
| /groups, /groups/:id | Groups, Group detail | Members, sessions, progress, discussion |
| OAuth authorize | Not in the app | Web-only |

Tabs: Home, Read, Library, Journal, Groups.

Not in the first release (web-only for now): the AI study chat (its gateway is still rate-limited, so I can't verify it), the admin tools, and the Google Calendar panel (already dropped).

## Auth

The web app uses Neon Auth through the server's `/api/auth` proxy, with cookies. A phone app has no cookie jar it can share with the browser. I plan to use Neon Auth's bearer-token sign-in. I have not verified that the Neon Auth configuration here supports it. If it doesn't, I'd add a small `/api/mobile/sign-in` route on the server that returns the same JWT. That is a server change, so I'll flag it before doing it.

## Stores and accounts

- Apple App Store needs an Apple Developer account ($99/year). Google Play needs a Play Console account ($25 one-time). You have neither yet, so both need creating before the first release.
- Store builds run through Expo's cloud build (EAS). I will not build binaries in this sandbox. Builds and store submission happen from the mobile preview dashboard, where you connect your Expo account.
- Store listings need a privacy policy URL, screenshots, and an app description. Apple also needs a sign-in review note because the app has accounts.

## Steps

1. Scaffold `mobile/` with Expo, and confirm sign-in against Neon Auth (bearer token). Stop here if it doesn't work and report back.
2. Auth screens and tab shell.
3. Read (the core feature), then Home and Library.
4. Study and Lesson, then Journal.
5. Groups, with live updates in a later pass.
6. Test on device in Expo Go, then publish builds from the dashboard.

## Open decisions

- Should the first release ship with Groups, or without it?
- Who owns the Apple and Google accounts?
