'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type User = {
	id?: string
	name?: string
	username?: string
	email?: string
}

type AuthResponse = {
	accessToken?: string
	user?: User
}

function getBackendUrl(path: string) {
	return `${process.env.BACKEND_API_URL}${path}`
}

function getUserFromResponse(data: unknown): User | null {
	if (!data || typeof data !== 'object') {
		return null
	}

	if ('user' in data) {
		const user = data.user
		return user && typeof user === 'object' ? user : null
	}

	return data
}

export async function getCurrentUser() {
	const ck = await cookies()
	const token = ck.get('session')?.value

	if (!token) {
		return null
	}

	const res = await fetch(getBackendUrl('/auth/me'), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		cache: 'no-store',
	})

	if (!res.ok) {
		return null
	}

	const data = await res.json().catch(() => null)

	return getUserFromResponse(data)
}

export async function me() {
	const user = await getCurrentUser()

	if (!user) {
		redirect('/auth/signin')
	}

	return user
}

export async function signin(formData: FormData) {
	const username = formData.get('username')
	const password = formData.get('password')

	if (!username || !password) return

	const res = await fetch(getBackendUrl('/auth/login'), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
		cache: 'no-store',
	})
	const data = (await res.json().catch(() => null)) as AuthResponse | null

	if (!data?.accessToken) {
		revalidatePath('/auth')
		return
	}

	const ck = await cookies()
	ck.set('session', data?.accessToken, {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	})
	redirect('/app/home')
}

export async function signup(formData: FormData) {
	const username = formData.get('username')
	const password = formData.get('password')
	const confirmPassword = formData.get('confirm-password')

	if (
		!username ||
		!password ||
		!confirmPassword ||
		confirmPassword !== password
	)
		return

	const res = await fetch(getBackendUrl('/auth/register'), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
		cache: 'no-store',
	})
	const data = (await res.json().catch(() => null)) as AuthResponse | null

	if (!data?.accessToken) {
		revalidatePath('/auth')
		return
	}

	const ck = await cookies()
	ck.set('session', data?.accessToken, {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	})
	redirect('/app/home')
}

export async function logout() {
	const ck = await cookies()
	const token = ck.get('session')?.value

	if (token) {
		await fetch(getBackendUrl('/auth/logout'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			cache: 'no-store',
		}).catch(() => null)
	}

	ck.set('session', '', {
		httpOnly: true,
		path: '/',
		maxAge: 0,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	})
	revalidatePath('/app', 'layout')
	redirect('/auth/signin')
}
