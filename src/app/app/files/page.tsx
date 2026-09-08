import { FolderXIcon } from 'lucide-react'

import { redirectToRootFolder } from './actions'

export default async function FilesPage() {
	await redirectToRootFolder()

	return (
		<div className="min-h-[calc(100vh-65px)] bg-muted/30 px-4 py-6">
			<div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-5">
				<section className="flex min-h-[calc(100vh-130px)] items-center justify-center rounded-lg border border-dashed border-border bg-background p-8 text-center shadow-sm">
					<div className="flex max-w-sm flex-col items-center">
						<FolderXIcon
							aria-hidden="true"
							className="mb-3 size-10 text-muted-foreground"
						/>
						<h2 className="text-base font-semibold">Root folder is missing</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Contact administrator to restore your workspace root folder.
						</p>
					</div>
				</section>
			</div>
		</div>
	)
}
