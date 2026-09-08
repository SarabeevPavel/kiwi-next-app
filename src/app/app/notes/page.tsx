import { Suspense } from 'react'

import { getNotes } from './actions'
import NotesLoading from './notes-loading'
import NotesView from './notes-view'

async function NotesContent() {
	const notes = await getNotes()

	return <NotesView data={notes} />
}

export default function NotesPage() {
	return (
		<div className="min-h-[calc(100vh-65px)] bg-muted/30 px-4 py-6">
			<div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-5">
				<Suspense fallback={<NotesLoading />}>
					<NotesContent />
				</Suspense>
			</div>
		</div>
	)
}
