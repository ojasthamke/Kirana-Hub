import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import LoginClient from './LoginClient';

export default function LoginPage() {
    const session = getAuthSession();
    // If user is already logged in, redirect them to the correct page
    if (session) {
        if (session.role === 'admin') redirect('/admin');
        if (session.role === 'vendor') redirect('/agency');
        redirect('/');
    }
    return <LoginClient />;
}
