
export function currentdate() {
	return String(
		(new Date().toISOString()).slice(0, 10).split('-').reverse()
	).replaceAll(',', '/')
}