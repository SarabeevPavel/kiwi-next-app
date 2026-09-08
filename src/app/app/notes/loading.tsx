import NotesLoading from './notes-loading'

export default function Loading() {
	return (
		<div className="min-h-[calc(100vh-65px)] bg-muted/30 px-4 py-6">
			<div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-5">
				<header className="flex flex-col gap-1">
					<div className="h-4 w-24 animate-pulse rounded bg-muted" />
					<div className="h-8 w-32 animate-pulse rounded bg-muted" />
				</header>

				<NotesLoading />
			</div>
		</div>
	)
}
