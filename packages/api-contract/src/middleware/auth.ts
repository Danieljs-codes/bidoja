import { HttpApiMiddleware, HttpApiSecurity } from "effect/unstable/httpapi";
import { auth } from "@bidoja/auth";
import type { Brand } from "effect/Brand";

type CurrentUser = Omit<typeof auth.$Infer.Session.user, "id"> & {
  id: Brand<"UserId">;
};

export class AuthMiddleware extends HttpApiMiddleware.Service<
  AuthMiddleware,
  {
    provides: CurrentUser;
  }
>()("AuthMiddleware", {
  security: {
    // BetterAuth uses cookies for session management
    cookie: HttpApiSecurity.apiKey({
      in: "cookie",
      key: "better-auth.session_token",
    }),
  },
}) {}
