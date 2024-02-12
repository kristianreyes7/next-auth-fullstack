"use client";
import { useSession, signIn, signOut } from "next-auth/react";

const SignInButton = () => {
  const { data: session } = useSession();
  return (
    <>
      {session ? (
        <button
          onClick={() => {
            signOut();
            window.location.href = "/api/auth/signout";
          }}
        >
          <span>Sign Out</span>
        </button>
      ) : (
        <button onClick={() => signIn("wynnlogin")}>Sign In</button>
      )}
    </>
  );
};

export default SignInButton;
