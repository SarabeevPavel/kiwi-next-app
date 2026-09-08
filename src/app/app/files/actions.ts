'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { me } from '@/app/auth/actions'

export type FolderEntryType = 'Folder' | 'File'

export interface CreatedBy {
	id: string
	username: string
}

export interface FolderEntry {
	type: unknown
	id: string
	name?: string | null
	parentId?: string | null
	size?: number | null
	createdAt?: string | null
	createdBy?: CreatedBy | null
}

export interface Folder {
	id: string
	name?: string | null
	parentId?: string | null
	createdAt?: string | null
	createdBy?: CreatedBy | null
	entries?: FolderEntry[] | null
}

function getBackendUrl(path: string) {
	return `${process.env.BACKEND_API_URL}${path}`
}

async function getSessionToken() {
	const ck = await cookies()
	return ck.get('session')?.value
}

function getFolderFromResponse(data: unknown) {
	if (!data || typeof data !== 'object') {
		return null
	}

	return data as Folder
}

function getFolderEntryFromResponse(data: unknown) {
	if (!data || typeof data !== 'object') {
		return null
	}

	return data as FolderEntry
}

export async function getRootFolderId() {
	const user = await me()

	return user.rootFolderId ?? null
}

export async function redirectToRootFolder() {
	const rootFolderId = await getRootFolderId()

	if (!rootFolderId) {
		return null
	}

	redirect(`/app/files/${rootFolderId}`)
}

export async function getFolder(id: string) {
	const token = await getSessionToken()

	if (!token) {
		redirect('/auth/signin')
	}

	const res = await fetch(getBackendUrl(`/folders/${id}`), {
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

	return getFolderFromResponse(data)
}

export async function uploadFile(formData: FormData) {
	const token = await getSessionToken()

	if (!token) {
		throw new Error('Unauthorized')
	}

	const res = await fetch(getBackendUrl('/files'), {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: formData,
		cache: 'no-store',
	})

	if (!res.ok) {
		throw new Error('Failed to upload file')
	}

	const data = await res.json().catch(() => null)

	revalidatePath('/app/files')

	return getFolderEntryFromResponse(data)
}

export async function createFolder(parentFolderId: string, name: string) {
	const token = await getSessionToken()

	if (!token) {
		throw new Error('Unauthorized')
	}

	const res = await fetch(getBackendUrl('/folders'), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			parentFolderId,
			name,
		}),
		cache: 'no-store',
	})

	if (!res.ok) {
		throw new Error('Failed to create folder')
	}

	const data = await res.json().catch(() => null)

	revalidatePath('/app/files')

	return getFolderEntryFromResponse(data)
}

export async function deleteFile(id: string) {
	const token = await getSessionToken()

	if (!token) {
		throw new Error('Unauthorized')
	}

	const res = await fetch(getBackendUrl(`/files/${id}`), {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		cache: 'no-store',
	})

	if (!res.ok) {
		throw new Error('Failed to delete file')
	}

	revalidatePath('/app/files')

	return true
}

export async function deleteFolder(id: string) {
	const token = await getSessionToken()

	if (!token) {
		throw new Error('Unauthorized')
	}

	const res = await fetch(getBackendUrl(`/folders/${id}`), {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		cache: 'no-store',
	})

	if (!res.ok) {
		throw new Error('Failed to delete folder')
	}

	revalidatePath('/app/files')

	return true
}
