import FilesLoading from '../files-loading'

export default function Loading() {
	return (
		<div className="min-h-[calc(100vh-65px)] bg-muted/30 px-4 py-6">
			<div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-5">
				<FilesLoading />
			</div>
		</div>
	)
}
