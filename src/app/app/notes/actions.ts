'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export interface Note {
	id: number
	title: string
	body: string
	isFavorite: boolean
}

export type GetNotesResponse = Note[]
export type NotePayload = Pick<Note, 'title' | 'body' | 'isFavorite'>

function getBackendUrl(path: string) {
	return `${process.env.BACKEND_API_URL}${path}`
}

function getNotesFromResponse(data: unknown): GetNotesResponse | null {
	if (!data || typeof data !== 'object') {
		return null
	}

	return data as GetNotesResponse
}

export async function getNotes() {
	const ck = await cookies()
	const token = ck.get('session')?.value

	if (!token) {
		return null
	}

	const res = await fetch(getBackendUrl('/notes'), {
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

	return getNotesFromResponse(data)
}

function getNoteFromResponse(data: unknown) {
	if (!data || typeof data !== 'object') {
		return null
	}

	if ('note' in data) {
		const note = data.note
		return note && typeof note === 'object' ? (note as Note) : null
	}

	return data as Note
}

async function getSessionToken() {
	const ck = await cookies()
	return ck.get('session')?.value
}

export async function createNote(payload: NotePayload) {
	const { title, body, isFavorite } = payload

	if (!title) return

	const token = await getSessionToken()

	if (!token) {
		throw new Error('Unauthorized')
	}

	const res = await fetch(getBackendUrl('/notes'), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ title, body, isFavorite }),
		cache: 'no-store',
	})

	if (!res.ok) {
		throw new Error('Failed to create note')
	}

	const data = await res.json().catch(() => null)

	revalidatePath('/app/notes')

	return getNoteFromResponse(data)
}

export async function editNote(id: Note['id'], payload: NotePayload) {
	const token = await getSessionToken()

	if (!token) {
		throw new Error('Unauthorized')
	}

	const res = await fetch(getBackendUrl(`/notes/${id}`), {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(payload),
		cache: 'no-store',
	})

	if (!res.ok) {
		throw new Error('Failed to save note')
	}

	const data = await res.json().catch(() => null)

	revalidatePath('/app/notes')

	return getNoteFromResponse(data)
}

export async function deleteNote(id: Note['id']) {
	const token = await getSessionToken()

	if (!token) {
		throw new Error('Unauthorized')
	}

	const res = await fetch(getBackendUrl(`/notes/${id}`), {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		cache: 'no-store',
	})

	if (!res.ok) {
		throw new Error('Failed to delete note')
	}

	revalidatePath('/app/notes')

	return true
}
