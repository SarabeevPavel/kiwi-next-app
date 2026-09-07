export default function AuthLayout({ children }: LayoutProps<'/auth'>) {
	return (
		<main className="flex-1 w-full h-full flex items-center justify-center">
			{children}
		</main>
	)
}
