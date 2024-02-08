'use client'
import { useSession, signIn, signOut } from 'next-auth/react'

const SignInButton = () => {
  const { data: session } = useSession()

  return (
    <>
      {session ? (
       <button onClick={() => signOut()}>
        <span>Sign Out</span>
       </button>
      ) : (
        <button onClick={() => signIn()}>
          Sign In
        </button>
      )}
    </>
  )
}

export default SignInButton