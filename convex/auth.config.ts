export default {
  providers: [
    {
      domain: `https://${process.env.CLERK_HOSTNAME}`,
      applicationID: "convex",
    },
    {
      domain: `https://clerk.${process.env.CLERK_HOSTNAME}`,
      applicationID: "convex",
    },
  ],
};
