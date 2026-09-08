export default function NotesLoading() {
	return (
		<section className="grid min-h-[640px] overflow-hidden rounded-lg border border-border bg-background shadow-sm lg:grid-cols-[320px_1fr]">
			<aside className="flex min-h-0 flex-col border-b border-border bg-card lg:border-r lg:border-b-0">
				<div className="flex h-14 items-center justify-between border-b border-border px-4">
					<div className="h-3 w-20 animate-pulse rounded bg-muted" />
					<div className="size-7 animate-pulse rounded-lg bg-muted" />
				</div>

				<div className="mx-4 mt-4 h-9 animate-pulse rounded-lg bg-muted" />

				<div className="flex flex-col gap-2 p-3">
					{Array.from({ length: 7 }).map((_, index) => (
						<div
							key={index}
							className="flex items-start gap-3 rounded-lg px-3 py-2.5"
						>
							<div className="size-8 shrink-0 animate-pulse rounded-md bg-muted" />
							<div className="min-w-0 flex-1 space-y-2">
								<div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
								<div className="h-2 w-full animate-pulse rounded bg-muted" />
							</div>
						</div>
					))}
				</div>
			</aside>

			<div className="flex min-h-0 flex-col">
				<div className="flex h-14 items-center justify-between border-b border-border px-5">
					<div className="space-y-2">
						<div className="h-3 w-28 animate-pulse rounded bg-muted" />
						<div className="h-2 w-16 animate-pulse rounded bg-muted" />
					</div>
					<div className="flex gap-1">
						<div className="size-7 animate-pulse rounded-lg bg-muted" />
						<div className="size-7 animate-pulse rounded-lg bg-muted" />
					</div>
				</div>

				<div className="flex flex-1 flex-col gap-4 p-5">
					<div className="h-9 w-2/3 animate-pulse rounded bg-muted" />
					<div className="space-y-3">
						<div className="h-3 w-full animate-pulse rounded bg-muted" />
						<div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
						<div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
					</div>
				</div>
			</div>
		</section>
	)
}
