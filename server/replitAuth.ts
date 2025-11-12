// server/replitAuth.ts
import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage"; // you already use this elsewhere

// Shape of the user we keep in the session
interface AppUser {
  id: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  role?: string | null;
}

// Tell Passport how to put a user into the session
passport.serializeUser((user: any, done) => {
  done(null, user.id); // store only user id in the session
});

// And how to get it back from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id); // you already have getUser(userId)
    if (!user) return done(null, false);

    const appUser: AppUser = {
      id: user.id,           // adjust if your user object uses a different key
      name: user.name ?? null,
      email: user.email ?? null,
      picture: user.picture ?? null,
      role: user.role ?? null,
    };

    done(null, appUser);
  } catch (err) {
    done(err);
  }
});

export async function setupAuth(app: Express) {
  // 1) Session middleware (required for Passport)
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production", // true on Render (https)
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // 2) Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // 3) Configure Google strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value || null;
          const name = profile.displayName || null;
          const picture = profile.photos?.[0]?.value || null;

          // Look up the user in your storage, or create one if not exists.
          // 🔴 YOU MUST ADAPT THIS PART TO MATCH YOUR ACTUAL STORAGE API.
          let user = await storage.getUser(googleId);

          if (!user) {
            // Example: if your storage has a createUser method
            // Adjust the field names to your schema.
            user = await storage.createUser({
              id: googleId,
              email,
              name,
              picture,
              role: "member", // default role; presidents are promoted via your existing route
            });
          }

          const appUser: AppUser = {
            id: user.id,
            name: user.name ?? name,
            email: user.email ?? email,
            picture: user.picture ?? picture,
            role: user.role,
          };

          return done(null, appUser);
        } catch (err) {
          return done(err as any);
        }
      }
    )
  );

  // 4) Auth routes
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login", // adjust if you have a login page
      session: true,
    }),
    (req: any, res: Response) => {
      // Normalize to the `req.user.claims.sub` shape your routes expect
      if (req.user && !req.user.claims) {
        req.user.claims = { sub: req.user.id };
      }
      // Redirect to your main app page
      res.redirect("/");
    }
  );

  app.post("/auth/logout", (req: any, res: Response, next: NextFunction) => {
    // Passport 0.6+ logout is async
    req.logout(function (err: any) {
      if (err) return next(err);
      req.session.destroy(() => {
        res.json({ success: true });
      });
    });
  });
}

// Middleware: require authentication
export function isAuthenticated(req: any, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    // Make sure req.user.claims.sub exists as used in routes.ts
    if (req.user && !req.user.claims) {
      req.user.claims = { sub: req.user.id };
    }
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
}

// Middleware: require president role
export async function isPresident(req: any, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.user.claims?.sub) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);

    if (user?.role === "president") {
      return next();
    }

    return res.status(403).json({ error: "Requires president role" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to check role" });
  }
}
