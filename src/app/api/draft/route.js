import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

const KNOWN_LANGS = ['en', 'es']
const DEFAULT_PREVIEW_LANG = process.env.PREVIEW_DEFAULT_LANG || 'en'

function normalizePreviewSlug(slug) {
	const segments = String(slug || '')
		.trim()
		.replace(/^\/+|\/+$/g, '')
		.split('/')
		.filter(Boolean)

	for (let i = segments.length - 1; i >= 0; i -= 1) {
		if (segments[i] === 'preview') {
			segments.splice(i, 1)
		}
	}

	return segments.join('/')
}

export async function GET(request) {
	const DRAFT_MODE_TOKEN = process.env.DRAFT_MODE_TOKEN
	// Parse query string parameters
	const { searchParams } = new URL(request.url)
	const secret = searchParams.get('token')
	const slug = searchParams.get('slug')
	const lang = searchParams.get('lang')

	//const cookieStore = await cookies()
	//cookieStore.set('__page_preview', slug)
	// Check the secret and next parameters
	// This secret should only be known to this Route Handler and the CMS
	if (secret !== DRAFT_MODE_TOKEN || !slug) {
		return new Response('Invalid token', { status: 401 })
	}
	// Enable Draft Mode by setting the cookie
	const draft = await draftMode()
	draft.enable()

	const cleanSlug = normalizePreviewSlug(slug)
	const cleanSlugSegments = cleanSlug.split('/').filter(Boolean)
	const normalizedLang = String(lang || '')
		.trim()
		.replace(/^\/+|\/+$/g, '')

	const firstSegment = cleanSlugSegments[0]
	const resolvedLang = normalizedLang || (KNOWN_LANGS.includes(firstSegment) ? firstSegment : DEFAULT_PREVIEW_LANG)

	const slugWithoutLang =
		cleanSlugSegments[0] === resolvedLang ? cleanSlugSegments.slice(1) : cleanSlugSegments

	/*
	const previewPath = slugWithoutLang.length
		? `/${resolvedLang}/preview/${slugWithoutLang.join('/')}`
		: `/${resolvedLang}/preview`

	redirect(previewPath)
	 */
	redirect(`/preview/${cleanSlug}`)
}