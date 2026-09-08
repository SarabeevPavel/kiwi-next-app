'use client'

import { FileTextIcon, PlusIcon, SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui'

import {
	createNote,
	deleteNote,
	editNote,
	type GetNotesResponse,
	type Note,
	type NotePayload,
} from './actions'
import NoteEditForm, {
	type NoteEditFormHandle,
	type NoteFormData,
} from './note-edit-form'
import NotesListItem from './notes-list-lite'

interface NotesViewProps {
	data: GetNotesResponse | null
}

const NEW_NOTE_ID = -1

function createDraftNote(): Note {
	return {
		id: NEW_NOTE_ID,
		title: '',
		body: '',
		isFavorite: false,
	}
}

function getPayload(values: NoteFormData): NotePayload {
	return {
		title: values.title,
		body: values.body,
		isFavorite: values.isFavorite,
	}
}

function updateNoteInList(notes: Note[], note: Note) {
	const index = notes.findIndex((item) => item.id === note.id)

	if (index === -1) {
		return [note, ...notes]
	}

	return notes.map((item) => (item.id === note.id ? note : item))
}

export default function NotesView({ data }: NotesViewProps) {
	const router = useRouter()
	const formRef = useRef<NoteEditFormHandle>(null)
	const [notes, setNotes] = useState<Note[]>(data ?? [])
	const [draftNote, setDraftNote] = useState<Note>(() => createDraftNote())
	const [selectedNoteId, setSelectedNoteId] = useState<number | null>(
		data?.[0]?.id ?? null,
	)
	const [pendingNote, setPendingNote] = useState<Note | null>(null)
	const [savingNoteIds, setSavingNoteIds] = useState<Set<number>>(
		() => new Set(),
	)
	const [search, setSearch] = useState('')
	const [toastMessage, setToastMessage] = useState<string | null>(null)

	useEffect(() => {
		if (!toastMessage) {
			return
		}

		const timer = window.setTimeout(() => {
			setToastMessage(null)
		}, 3500)

		return () => window.clearTimeout(timer)
	}, [toastMessage])

	const selectedNote = useMemo(() => {
		if (selectedNoteId === NEW_NOTE_ID) {
			return draftNote
		}

		return notes.find((note) => note.id === selectedNoteId) ?? null
	}, [draftNote, notes, selectedNoteId])
	// TODO: temp FE favorite sort, waiting API support
	const sortedNotes = useMemo(() => {
		return [...notes].sort(
			(a, b) => Number(b.isFavorite) - Number(a.isFavorite),
		)
	}, [notes])

	// TODO: temp FE search, waiting API support
	const filteredNotes = useMemo(() => {
		const value = search.trim().toLowerCase()

		if (!value) {
			return sortedNotes
		}

		return sortedNotes.filter((note) => {
			return (
				note.title.toLowerCase().includes(value) ||
				note.body.toLowerCase().includes(value)
			)
		})
	}, [search, sortedNotes])
	const isCreatingNote = selectedNoteId === NEW_NOTE_ID
	const isCreatingNoteSaving = savingNoteIds.has(NEW_NOTE_ID)

	function setNoteSaving(noteId: number, isSaving: boolean) {
		setSavingNoteIds((current) => {
			const next = new Set(current)

			if (isSaving) {
				next.add(noteId)
			} else {
				next.delete(noteId)
			}

			return next
		})
	}

	function switchToNote(note: Note) {
		setSelectedNoteId(note.id)
	}

	function runBackgroundSave(values: NoteFormData) {
		const optimisticNote: Note = {
			id: values.id,
			title: values.title,
			body: values.body,
			isFavorite: values.isFavorite,
		}

		setNoteSaving(values.id, true)
		setNotes((current) => updateNoteInList(current, optimisticNote))

		void (async () => {
			try {
				const savedNote =
					values.id === NEW_NOTE_ID
						? await createNote(getPayload(values))
						: await editNote(values.id, getPayload(values))

				if (savedNote) {
					setNotes((current) => {
						if (values.id !== NEW_NOTE_ID) {
							return updateNoteInList(current, savedNote)
						}

						const hasDraft = current.some((note) => note.id === NEW_NOTE_ID)

						if (!hasDraft) {
							return updateNoteInList(current, savedNote)
						}

						return current.map((note) =>
							note.id === NEW_NOTE_ID ? savedNote : note,
						)
					})

					if (values.id === NEW_NOTE_ID) {
						setDraftNote(createDraftNote())
						setSelectedNoteId((current) =>
							current === NEW_NOTE_ID ? savedNote.id : current,
						)
					}
				}

				router.refresh()
			} catch {
				setToastMessage('Failed to save note')
			} finally {
				setNoteSaving(values.id, false)
			}
		})()
	}

	function runBackgroundDelete(note: Note) {
		setNoteSaving(note.id, true)

		if (note.id === selectedNoteId) {
			const nextNote = notes.find((item) => item.id !== note.id) ?? null
			setSelectedNoteId(nextNote?.id ?? null)
		}

		void (async () => {
			try {
				await deleteNote(note.id)
				setNotes((current) => current.filter((item) => item.id !== note.id))
				router.refresh()
			} catch {
				setToastMessage('Failed to delete note')
			} finally {
				setNoteSaving(note.id, false)
			}
		})()
	}

	function runBackgroundFavorite(note: Note) {
		const previousNote = note
		const nextNote = {
			...note,
			isFavorite: !note.isFavorite,
		}

		setNoteSaving(note.id, true)
		setNotes((current) => updateNoteInList(current, nextNote))

		void (async () => {
			try {
				const savedNote = await editNote(note.id, getPayload(nextNote))

				if (savedNote) {
					setNotes((current) => updateNoteInList(current, savedNote))
				}

				router.refresh()
			} catch {
				setNotes((current) => updateNoteInList(current, previousNote))
				setToastMessage('Failed to update note')
			} finally {
				setNoteSaving(note.id, false)
			}
		})()
	}

	async function saveCurrentIfNeeded() {
		if (!formRef.current?.hasChanges()) {
			return true
		}

		const values = await formRef.current.getValidatedSnapshot()

		if (!values) {
			return false
		}

		runBackgroundSave(values)

		return true
	}

	async function handleSelectNote(note: Note) {
		if (note.id === selectedNoteId) {
			return
		}

		const canLeave = await saveCurrentIfNeeded()

		if (!canLeave) {
			setPendingNote(note)
			return
		}

		switchToNote(note)
	}

	async function handleCreateNote() {
		if (isCreatingNote) {
			formRef.current?.discardChanges()
			setDraftNote(createDraftNote())
			setSelectedNoteId(sortedNotes[0]?.id ?? null)
			return
		}

		const canLeave = await saveCurrentIfNeeded()

		if (!canLeave) {
			setPendingNote(createDraftNote())
			return
		}

		setDraftNote(createDraftNote())
		setSelectedNoteId(NEW_NOTE_ID)
	}

	function handleDiscardChanges() {
		if (!pendingNote) {
			return
		}

		formRef.current?.discardChanges()

		if (pendingNote.id === NEW_NOTE_ID) {
			setDraftNote(createDraftNote())
		}

		switchToNote(pendingNote)
		setPendingNote(null)
	}

	function handleDeleteSelectedNote(note: Note) {
		formRef.current?.discardChanges()
		runBackgroundDelete(note)
	}

	return (
		<section className="relative grid min-h-[calc(100vh-130px)] overflow-hidden rounded-lg border border-border bg-background shadow-sm lg:grid-cols-[320px_1fr]">
			<aside className="flex min-h-0 flex-col border-b border-border bg-card lg:border-r lg:border-b-0">
				<div className="flex h-14 items-center justify-between border-b border-border px-4">
					<div>
						<h2 className="text-sm font-semibold">My notes</h2>
					</div>
					<Button
						variant={isCreatingNote ? 'destructive' : 'default'}
						size="sm"
						aria-label={isCreatingNote ? 'Cancel new note' : 'Create note'}
						disabled={isCreatingNoteSaving}
						onClick={handleCreateNote}
					>
						{isCreatingNote ? (
							<XIcon aria-hidden="true" className="size-3.5" />
						) : (
							<PlusIcon aria-hidden="true" className="size-3.5" />
						)}
						{isCreatingNote ? 'Cancel' : 'New Note'}
					</Button>
				</div>

				<label className="relative mx-4 mt-4 block">
					<SearchIcon
						aria-hidden="true"
						className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<input
						type="search"
						placeholder="Search notes"
						value={search}
						className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
						onChange={(event) => setSearch(event.target.value)}
					/>
				</label>

				<div className="min-h-0 flex-1 overflow-y-auto p-3">
					{selectedNoteId === NEW_NOTE_ID ? (
						<ul className="mb-2 flex flex-col gap-1">
							<NotesListItem
								data={{ ...draftNote, title: draftNote.title || 'New Note' }}
								isSaving={savingNoteIds.has(NEW_NOTE_ID)}
								isSelected
								onSelect={() => void handleSelectNote(draftNote)}
							/>
						</ul>
					) : null}

					{filteredNotes.length ? (
						<ul className="flex flex-col gap-1">
							{filteredNotes.map((note) => (
								<NotesListItem
									key={note.id}
									data={note}
									isSaving={savingNoteIds.has(note.id)}
									isSelected={note.id === selectedNoteId}
									onDelete={() => runBackgroundDelete(note)}
									onSelect={() => void handleSelectNote(note)}
									onToggleFavorite={() => runBackgroundFavorite(note)}
								/>
							))}
						</ul>
					) : (
						<div className="flex h-full min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center">
							<FileTextIcon
								aria-hidden="true"
								className="mb-3 size-8 text-muted-foreground"
							/>
							<p className="text-sm font-medium">
								{search ? 'No notes found' : 'No notes yet'}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								{search
									? 'Try another search query.'
									: 'Create your first note when the backend action is ready.'}
							</p>
						</div>
					)}
				</div>
			</aside>

			<NoteEditForm
				ref={formRef}
				initialData={selectedNote}
				onDelete={handleDeleteSelectedNote}
				onSubmit={runBackgroundSave}
			/>

			{pendingNote ? (
				<div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-base font-semibold">Invalid note</h2>
								<p className="mt-1 text-sm text-muted-foreground">
									Fix the highlighted fields before switching, or discard the
									current changes.
								</p>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label="Close dialog"
								onClick={() => setPendingNote(null)}
							>
								<XIcon aria-hidden="true" className="size-4" />
							</Button>
						</div>

						<div className="mt-5 flex justify-end gap-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setPendingNote(null)}
							>
								Continue editing
							</Button>
							<Button type="button" onClick={handleDiscardChanges}>
								Discard changes
							</Button>
						</div>
					</div>
				</div>
			) : null}

			{toastMessage ? (
				<div className="absolute right-4 bottom-4 z-30 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
					{toastMessage}
				</div>
			) : null}
		</section>
	)
}
