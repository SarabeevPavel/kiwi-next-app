export default function FilesLoading() {
	return (
		<section className="flex min-h-[640px] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
			<div className="flex h-14 items-center justify-between border-b border-border px-4">
				<div className="space-y-2">
					<div className="h-3 w-32 animate-pulse rounded bg-muted" />
					<div className="h-2 w-20 animate-pulse rounded bg-muted" />
				</div>
				<div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
			</div>

			<div className="border-b border-border p-4">
				<div className="h-9 w-full max-w-sm animate-pulse rounded-lg bg-muted" />
			</div>

			<div className="min-h-0 flex-1 divide-y divide-border overflow-hidden">
				{Array.from({ length: 8 }).map((_, index) => (
					<div key={index} className="grid grid-cols-[1fr_110px_70px] gap-4 px-4 py-3">
						<div className="flex items-center gap-3">
							<div className="size-9 animate-pulse rounded-md bg-muted" />
							<div className="h-3 w-48 animate-pulse rounded bg-muted" />
						</div>
						<div className="h-3 w-16 animate-pulse self-center rounded bg-muted" />
						<div className="size-7 animate-pulse justify-self-end rounded-lg bg-muted" />
					</div>
				))}
			</div>
		</section>
	)
}
