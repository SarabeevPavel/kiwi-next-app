export async function POST() {
	const todo = await fetch(`${process.env.BACKEND_API_URL}/auth/logout`, {
		cache: 'no-store',
	}).then((r) => r.json())
	return Response.json(todo)
}
