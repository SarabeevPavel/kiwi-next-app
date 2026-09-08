'use client'

import {
	ArrowLeftIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	FileIcon,
	FolderIcon,
	FolderPlusIcon,
	Loader2Icon,
	SearchIcon,
	Trash2Icon,
	UploadIcon,
	XIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
	createColumnHelper,
	createPaginatedRowModel,
	rowPaginationFeature,
	tableFeatures,
	useTable,
} from '@tanstack/react-table'

import ConfirmationModal from '@/components/common/modals/ConfirmationModal'
import { Button } from '@/components/ui'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
	createFolder,
	deleteFile,
	deleteFolder,
	type Folder,
	type FolderEntry,
	uploadFile,
} from './actions'

interface FilesViewProps {
	folder: Folder
	folderIds: string[]
}

const fileTableFeatures = tableFeatures({
	rowPaginationFeature,
	paginatedRowModel: createPaginatedRowModel(),
})
const columnHelper = createColumnHelper<typeof fileTableFeatures, FolderEntry>()
const pageSizeOptions = [10, 15, 25]
const createdAtFormatter = new Intl.DateTimeFormat('en', {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
})
const createdAtFullFormatter = new Intl.DateTimeFormat('en', {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
})

function getEntryType(entry: FolderEntry) {
	if (typeof entry.type === 'string') {
		return entry.type.toLowerCase() === 'folder' ? 'Folder' : 'File'
	}

	if (entry.type === 0) {
		return 'Folder'
	}

	if (entry.type === 1) {
		return 'File'
	}

	return typeof entry.size === 'number' ? 'File' : 'Folder'
}

function getEntryName(entry: FolderEntry) {
	return (
		entry.name ||
		(getEntryType(entry) === 'Folder' ? 'Untitled folder' : 'Untitled file')
	)
}

function formatBytes(size?: number | null) {
	if (size == null) {
		return '-'
	}

	const units = ['B', 'KB', 'MB', 'GB']
	const index = Math.min(
		Math.floor(Math.log(size) / Math.log(1024)),
		units.length - 1,
	)
	const value = size / Math.pow(1024, index)

	return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

function getCreatedAtTime(entry: FolderEntry) {
	if (!entry.createdAt) {
		return 0
	}

	const time = new Date(entry.createdAt).getTime()

	return Number.isNaN(time) ? 0 : time
}

function formatCreatedAt(entry: FolderEntry) {
	const date = getCreatedAtDate(entry)

	if (!date) {
		return '-'
	}

	return createdAtFormatter.format(date)
}

function formatFullCreatedAt(entry: FolderEntry) {
	const date = getCreatedAtDate(entry)

	if (!date) {
		return undefined
	}

	return createdAtFullFormatter.format(date)
}

function getCreatedAtDate(entry: FolderEntry) {
	if (!entry.createdAt) {
		return null
	}

	const date = new Date(entry.createdAt)

	return Number.isNaN(date.getTime()) ? null : date
}

function sortEntries(entries: FolderEntry[]) {
	return [...entries].sort((a, b) => {
		const aType = getEntryType(a)
		const bType = getEntryType(b)

		if (aType !== bType) {
			return aType === 'Folder' ? -1 : 1
		}

		const createdAtDiff = getCreatedAtTime(b) - getCreatedAtTime(a)

		if (createdAtDiff !== 0) {
			return createdAtDiff
		}

		return getEntryName(a).localeCompare(getEntryName(b))
	})
}

function EntryNameCell({ entry }: { entry: FolderEntry }) {
	const entryType = getEntryType(entry)

	return (
		<div className="flex min-w-0 items-center gap-3">
			<span
				className={cn(
					'flex size-9 shrink-0 items-center justify-center rounded-md ring-1 ring-border',
					entryType === 'Folder'
						? 'bg-amber-50 text-amber-600'
						: 'bg-background text-muted-foreground',
				)}
			>
				{entryType === 'Folder' ? (
					<FolderIcon aria-hidden="true" className="size-4" />
				) : (
					<FileIcon aria-hidden="true" className="size-4" />
				)}
			</span>

			<span className="truncate text-sm font-medium">{getEntryName(entry)}</span>
		</div>
	)
}

export default function FilesView({ folder, folderIds }: FilesViewProps) {
	const router = useRouter()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [entries, setEntries] = useState<FolderEntry[]>(folder.entries ?? [])
	const [search, setSearch] = useState('')
	const [loadingEntryIds, setLoadingEntryIds] = useState<Set<string>>(
		() => new Set(),
	)
	const [uploadingEntryIds, setUploadingEntryIds] = useState<Set<string>>(
		() => new Set(),
	)
	const [isUploading, setIsUploading] = useState(false)
	const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
	const [folderName, setFolderName] = useState('')
	const [isCreatingFolder, setIsCreatingFolder] = useState(false)
	const [entryToDelete, setEntryToDelete] = useState<FolderEntry | null>(null)
	const [toastMessage, setToastMessage] = useState<string | null>(null)

	// TODO: temp FE folder/file sort, waiting API support
	const sortedEntries = useMemo(() => {
		return sortEntries(entries)
	}, [entries])

	// TODO: temp FE files search, waiting API support
	const filteredEntries = useMemo(() => {
		const value = search.trim().toLowerCase()

		if (!value) {
			return sortedEntries
		}

		return sortedEntries.filter((entry) =>
			getEntryName(entry).toLowerCase().includes(value),
		)
	}, [search, sortedEntries])

	const getFolderHref = useCallback(
		(entry: FolderEntry) => `/app/files/${[...folderIds, entry.id].join('/')}`,
		[folderIds],
	)

	const openFolder = useCallback(
		(entry: FolderEntry) => {
			if (getEntryType(entry) !== 'Folder') {
				return
			}

			router.push(getFolderHref(entry))
		},
		[getFolderHref, router],
	)

	const setEntryLoading = useCallback((id: string, isLoading: boolean) => {
		setLoadingEntryIds((current) => {
			const next = new Set(current)

			if (isLoading) {
				next.add(id)
			} else {
				next.delete(id)
			}

			return next
		})
	}, [])

	function setEntryUploading(id: string, isUploadingEntry: boolean) {
		setUploadingEntryIds((current) => {
			const next = new Set(current)

			if (isUploadingEntry) {
				next.add(id)
			} else {
				next.delete(id)
			}

			return next
		})
	}

	async function handleUpload(file?: File) {
		if (!file) {
			return
		}

		const tempId = `upload-${crypto.randomUUID()}`
		const tempEntry: FolderEntry = {
			id: tempId,
			type: 'File',
			name: file.name,
			parentId: folder.id,
			size: null,
			createdAt: new Date().toISOString(),
		}
		const formData = new FormData()
		formData.append('file', file)
		formData.append('parentId', folder.id)

		setIsUploading(true)
		setEntryLoading(tempId, true)
		setEntryUploading(tempId, true)
		setEntries((current) => [...current, tempEntry])

		try {
			const uploadedFile = await uploadFile(formData)

			if (uploadedFile) {
				setEntries((current) =>
					current.map((entry) =>
						entry.id === tempId
							? {
									...uploadedFile,
									createdAt: uploadedFile.createdAt ?? tempEntry.createdAt,
								}
							: entry,
					),
				)
			} else {
				setEntries((current) => current.filter((entry) => entry.id !== tempId))
			}

			router.refresh()
		} catch {
			setEntries((current) => current.filter((entry) => entry.id !== tempId))
			setToastMessage('Failed to upload file')
		} finally {
			setIsUploading(false)
			setEntryLoading(tempId, false)
			setEntryUploading(tempId, false)

			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	async function handleCreateFolder() {
		const name = folderName.trim()

		if (!name) {
			return
		}

		setIsCreatingFolder(true)

		try {
			const createdFolder = await createFolder(folder.id, name)

			if (createdFolder) {
				setEntries((current) => [
					...current,
					{
						...createdFolder,
						type: 'Folder',
						createdAt: createdFolder.createdAt ?? new Date().toISOString(),
					},
				])
			}

			setFolderName('')
			setIsCreateFolderOpen(false)
			router.refresh()
		} catch {
			setToastMessage('Failed to create folder')
		} finally {
			setIsCreatingFolder(false)
		}
	}

	const handleDelete = useCallback(
		async (entry: FolderEntry) => {
			setEntryLoading(entry.id, true)

			try {
				const entryType = getEntryType(entry)

				if (entryType === 'Folder') {
					await deleteFolder(entry.id)
				} else {
					await deleteFile(entry.id)
				}

				setEntries((current) => current.filter((item) => item.id !== entry.id))
				setEntryToDelete(null)
				router.refresh()
			} catch {
				setToastMessage(`Failed to delete ${getEntryType(entry).toLowerCase()}`)
			} finally {
				setEntryLoading(entry.id, false)
			}
		},
		[router, setEntryLoading],
	)

	const columns = useMemo(
		() =>
			columnHelper.columns([
				columnHelper.display({
					id: 'name',
					header: 'Name',
					cell: ({ row }) => <EntryNameCell entry={row.original} />,
				}),
				columnHelper.display({
					id: 'size',
					header: 'Size',
					cell: ({ row }) => {
						const entry = row.original
						const entryType = getEntryType(entry)

						if (uploadingEntryIds.has(entry.id)) {
							return (
								<span className="text-sm text-muted-foreground">
									Calculating...
								</span>
							)
						}

						return (
							<span className="text-sm text-muted-foreground">
								{entryType === 'File' ? formatBytes(entry.size) : '-'}
							</span>
						)
					},
				}),
				columnHelper.display({
					id: 'createdAt',
					header: 'Created At',
					cell: ({ row }) => (
						<span
							title={formatFullCreatedAt(row.original)}
							className="text-sm text-muted-foreground"
						>
							{formatCreatedAt(row.original)}
						</span>
					),
				}),
				columnHelper.display({
					id: 'actions',
					header: '',
					cell: ({ row }) => {
						const entry = row.original
						const isLoading = loadingEntryIds.has(entry.id)
						const entryType = getEntryType(entry)

						return (
							<div className="flex items-center justify-end">
								{isLoading ? (
									<span className="flex size-7 items-center justify-center text-muted-foreground">
										<Loader2Icon
											aria-hidden="true"
											className="size-4 animate-spin"
										/>
									</span>
								) : (
									<Button
										type="button"
										variant="destructive"
										size="icon-xs"
										aria-label={`Delete ${entryType.toLowerCase()}`}
										className="opacity-0 transition-opacity group-hover/file-row:opacity-100 group-focus-within/file-row:opacity-100"
										onClick={(event) => {
											event.stopPropagation()
											setEntryToDelete(entry)
										}}
									>
										<Trash2Icon
											aria-hidden="true"
											className="size-3.5 text-destructive/70 transition-colors group-hover/button:text-destructive"
										/>
									</Button>
								)}
							</div>
						)
					},
				}),
			]),
		[loadingEntryIds, uploadingEntryIds],
	)
	// TODO: temp FE pagination, waiting API support
	const table = useTable(
		{
			features: fileTableFeatures,
			columns,
			data: filteredEntries,
			getRowId: (entry) => entry.id,
			initialState: {
				pagination: {
					pageIndex: 0,
					pageSize: 10,
				},
			},
		},
		(state) => ({ pagination: state.pagination }),
	)
	const pagination = table.state.pagination
	const totalRows = table.getRowCount()
	const pageStart = totalRows
		? pagination.pageIndex * pagination.pageSize + 1
		: 0
	const pageEnd = Math.min(
		totalRows,
		(pagination.pageIndex + 1) * pagination.pageSize,
	)
	const isDeletingEntry = entryToDelete
		? loadingEntryIds.has(entryToDelete.id)
		: false
	const backHref =
		folderIds.length > 1
			? `/app/files/${folderIds.slice(0, -1).join('/')}`
			: folder.parentId
				? `/app/files/${folder.parentId}`
				: null

	return (
		<section className="relative flex min-h-[calc(100vh-130px)] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
			<div className="flex h-14 items-center justify-between border-b border-border px-4">
				<div className="flex min-w-0 items-center gap-2">
					{backHref ? (
						<Link
							href={backHref}
							aria-label="Back"
							className={cn(
								buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
							)}
						>
							<ArrowLeftIcon aria-hidden="true" className="size-4" />
						</Link>
					) : null}
					<div className="min-w-0">
						<h2 className="truncate text-sm font-semibold">
							{folder.name || 'Root folder'}
						</h2>
						<p className="text-xs text-muted-foreground">
							{entries.length} items
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setIsCreateFolderOpen(true)}
					>
						<FolderPlusIcon aria-hidden="true" className="size-3.5" />
						Create Folder
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						className="hidden"
						onChange={(event) => void handleUpload(event.target.files?.[0])}
					/>
					<Button
						type="button"
						size="sm"
						disabled={isUploading}
						onClick={() => fileInputRef.current?.click()}
					>
						{isUploading ? (
							<Loader2Icon
								aria-hidden="true"
								className="size-3.5 animate-spin"
							/>
						) : (
							<UploadIcon aria-hidden="true" className="size-3.5" />
						)}
						Upload file
					</Button>
				</div>
			</div>

			<div className="border-b border-border p-4">
				<label className="relative block max-w-sm">
					<SearchIcon
						aria-hidden="true"
						className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<input
						type="search"
						placeholder="Search files"
						value={search}
						className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
						onChange={(event) => setSearch(event.target.value)}
					/>
				</label>
			</div>

			{filteredEntries.length ? (
				<>
					<div className="min-h-0 flex-1 overflow-auto">
						<table className="w-full min-w-160 table-fixed">
							<thead className="sticky top-0 z-10 bg-background ring ring-gray-200">
								{table.getHeaderGroups().map((headerGroup) => (
									<tr key={headerGroup.id} className="border-b border-border">
										{headerGroup.headers.map((header) => (
											<th
												key={header.id}
												className={cn(
													'px-4 py-2 text-left text-xs font-medium text-muted-foreground',
													header.column.id === 'size' && 'w-32.5',
													header.column.id === 'createdAt' && 'w-44',
													header.column.id === 'actions' && 'w-16',
												)}
											>
												{header.isPlaceholder ? null : (
													<table.FlexRender header={header} />
												)}
											</th>
										))}
									</tr>
								))}
							</thead>
							<tbody className="divide-y divide-border border-t border-border">
								{table.getRowModel().rows.map((row) => {
									const entry = row.original
									const isFolder = getEntryType(entry) === 'Folder'

									return (
										<tr
											key={row.id}
											role={isFolder ? 'button' : undefined}
											tabIndex={isFolder ? 0 : undefined}
											className={cn(
												'group/file-row transition-colors hover:bg-muted',
												isFolder && 'cursor-pointer',
											)}
											onClick={() => openFolder(entry)}
											onKeyDown={(event) => {
												if (!isFolder) {
													return
												}

												if (event.key === 'Enter' || event.key === ' ') {
													event.preventDefault()
													openFolder(entry)
												}
											}}
										>
											{row.getAllCells().map((cell) => (
												<td
													key={cell.id}
													className={cn(
														'px-4 py-3 align-middle',
														cell.column.id === 'size' && 'w-32.5',
														cell.column.id === 'createdAt' && 'w-44',
														cell.column.id === 'actions' && 'w-16 text-right',
													)}
												>
													<table.FlexRender cell={cell} />
												</td>
											))}
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>

					<div className="flex h-12 shrink-0 items-center justify-between border-t border-border px-4">
						<p className="text-xs text-muted-foreground">
							{pageStart}-{pageEnd} of {totalRows}
						</p>

						<div className="flex items-center gap-2">
							<select
								value={pagination.pageSize}
								className="h-7 rounded-lg border border-input bg-background px-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
								onChange={(event) =>
									table.setPageSize(Number(event.target.value))
								}
							>
								{pageSizeOptions.map((pageSize) => (
									<option key={pageSize} value={pageSize}>
										{pageSize} / page
									</option>
								))}
							</select>

							<div className="flex items-center gap-1">
								<Button
									type="button"
									variant="outline"
									size="icon-sm"
									aria-label="Previous page"
									disabled={!table.getCanPreviousPage()}
									onClick={() => table.previousPage()}
								>
									<ChevronLeftIcon aria-hidden="true" className="size-4" />
								</Button>
								<span className="min-w-16 text-center text-xs text-muted-foreground">
									{pagination.pageIndex + 1} / {table.getPageCount()}
								</span>
								<Button
									type="button"
									variant="outline"
									size="icon-sm"
									aria-label="Next page"
									disabled={!table.getCanNextPage()}
									onClick={() => table.nextPage()}
								>
									<ChevronRightIcon aria-hidden="true" className="size-4" />
								</Button>
							</div>
						</div>
					</div>
				</>
			) : (
				<div className="flex min-h-0 flex-1 items-center justify-center p-8 text-center">
					<div className="flex max-w-sm flex-col items-center">
						<FolderIcon
							aria-hidden="true"
							className="mb-3 size-10 text-muted-foreground"
						/>
						<h2 className="text-base font-semibold">
							{search ? 'No files found' : 'This folder is empty'}
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							{search
								? 'Try another search query.'
								: 'Upload a file or create a folder to start filling this folder.'}
						</p>
					</div>
				</div>
			)}

			{isCreateFolderOpen ? (
				<div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
					<form
						className="w-full max-w-sm rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg"
						onSubmit={(event) => {
							event.preventDefault()
							void handleCreateFolder()
						}}
					>
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-base font-semibold">Create folder</h2>
								<p className="mt-1 text-sm text-muted-foreground">
									Add a folder inside {folder.name || 'Root folder'}.
								</p>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label="Close dialog"
								onClick={() => setIsCreateFolderOpen(false)}
							>
								<XIcon aria-hidden="true" className="size-4" />
							</Button>
						</div>

						<label className="mt-4 block">
							<span className="sr-only">Folder name</span>
							<input
								autoFocus
								type="text"
								placeholder="Folder name"
								value={folderName}
								className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
								onChange={(event) => setFolderName(event.target.value)}
							/>
						</label>

						<div className="mt-5 flex justify-end gap-2">
							<Button
								type="button"
								variant="ghost"
								disabled={isCreatingFolder}
								onClick={() => setIsCreateFolderOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isCreatingFolder || !folderName.trim()}
							>
								{isCreatingFolder ? (
									<Loader2Icon
										aria-hidden="true"
										className="size-3.5 animate-spin"
									/>
								) : (
									<FolderPlusIcon aria-hidden="true" className="size-3.5" />
								)}
								Create
							</Button>
						</div>
					</form>
				</div>
				) : null}

				<ConfirmationModal
					open={Boolean(entryToDelete)}
					title={`Delete ${
						entryToDelete ? getEntryType(entryToDelete).toLowerCase() : 'item'
					}?`}
					description={
						entryToDelete
							? `"${getEntryName(entryToDelete)}" will be deleted permanently.`
							: ''
					}
					confirmLabel="Delete"
					isLoading={isDeletingEntry}
					onClose={() => {
						if (!isDeletingEntry) {
							setEntryToDelete(null)
						}
					}}
					onConfirm={() => {
						if (entryToDelete) {
							void handleDelete(entryToDelete)
						}
					}}
				/>

				{toastMessage ? (
					<div className="absolute right-4 bottom-4 z-30 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
						{toastMessage}
				</div>
			) : null}
		</section>
	)
}
