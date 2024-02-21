"use client"
import { useSession, signIn } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Signin() {
    const router = useRouter()
    const query = useSearchParams()
    const callbackUrl = query.get('callbackUrl')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signIn('wynnlogin', {redirect: true, callbackUrl: callbackUrl || '/'})
        } else if (status === 'authenticated') {
            console.log("i got hereeeelkjasljkfd")
            router.push('/')
        }
    }, [router, status])

    return <div></div>
}