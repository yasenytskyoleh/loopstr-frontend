/** Central auth configuration. Destinations are configured here rather than as
 *  dead `#` links. */
export const authConfig = {
  routes: {
    login: "/login",
    signup: "/signup",
    forgotPassword: "/forgot-password",
  },
  /** Where a successful login sends the Member (the Homepage — HOME-01). */
  postAuthPath: "/",
} as const;
