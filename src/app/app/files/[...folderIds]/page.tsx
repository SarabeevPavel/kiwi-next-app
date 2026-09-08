import { FolderXIcon } from 'lucide-react'
import { Suspense } from 'react'

import { getFolder } from '../actions'
import FilesLoading from '../files-loading'
import FilesView from '../files-view'

async function FilesContent({ folderIds }: { folderIds: string[] }) {
	const folderId = folderIds.at(-1)

	if (!folderId) {
		return null
	}

	const folder = await getFolder(folderId)

	if (!folder) {
		return (
			<section className="flex min-h-[calc(100vh-130px)] items-center justify-center rounded-lg border border-dashed border-border bg-background p-8 text-center shadow-sm">
				<div className="flex max-w-sm flex-col items-center">
					<FolderXIcon
						aria-hidden="true"
						className="mb-3 size-10 text-muted-foreground"
					/>
					<h2 className="text-base font-semibold">Folder is unavailable</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						It may have been deleted or you may not have access to it.
					</p>
				</div>
			</section>
		)
	}

	return <FilesView folder={folder} folderIds={folderIds} />
}

export default async function FolderPage({
	params,
}: {
	params: Promise<{ folderIds: string[] }>
}) {
	const { folderIds } = await params

	return (
		<div className="min-h-[calc(100vh-65px)] bg-muted/30 px-4 py-6">
			<div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-5">
				<Suspense fallback={<FilesLoading />}>
					<FilesContent folderIds={folderIds} />
				</Suspense>
			</div>
		</div>
	)
}
