export async function POST() {
	const res = await fetch(`${process.env.BACKEND_API_URL}/auth/login`, {
		cache: 'no-store',
	}).then((r) => r.json())
	return Response.json(res)
}

// import { revalidateTag } from 'next/cache'
// import { NextRequest } from 'next/server'

// export async function POST(_req: NextRequest) {
// 	const tag = _req.nextUrl.searchParams.get('tag')
// 	if (tag) {
// 		revalidateTag(tag, { expire: 0 })
// 	}

// 	return Response.json({ ok: true })
// }
