/**
 * 
 * @param {object} stak 
 * @param {Array<string>} teams 
 * @returns 
 */
export function nameScoreValidation(stak, teams) {
	const { name, score } =
		typeof stak?.score === 'string' &&
			Number.isInteger(stak?.name)
			&& stak?.name >= 0
			? { name: stak.score, score: stak.name }
			: stak;
	if (
		typeof name === 'string' &&
		typeof score === 'number' &&
		teams?.includes(name) &&
		Number.isInteger(score) &&
		score >= 0
	) {
		return { name, score }
	}
	return false
}