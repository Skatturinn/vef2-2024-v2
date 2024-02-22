import { getGames, listTeams } from '../lib/db.js'

/**
 * ef test1 3, ef test2 0 annars 1
 * @param {boolean} test1 
 * @param {boolean} test2 
 * @returns {number}
 */
export function stigagjof(test1, test2) {
	return (test1 ? 3 : false)
		|| (test2 ? 0 : 1)
}

/**
 * skilar [3 0],[1 1] eða [0, 3]
 * @param {number} homeScore 
 * @param {number} awayScore 
 * @returns {Array<number>}
 */
export function stig(homeScore, awayScore) {
	if (
		typeof homeScore !== 'number' ||
		typeof awayScore !== 'number'
	) {
		throw new TypeError('Inntök þurfa að vera tölur')
	}
	const homestig = stigagjof(homeScore > awayScore, homeScore < awayScore)
	return [homestig, stigagjof(!homestig, homestig === 3)]
}

export async function stadan() {
	const teams = await listTeams();
	const stada = {};
	teams?.forEach(stak => { // Þurfum að stofna object
		stada[stak.name] = 0
	})
	const games = await getGames();
	games?.forEach(stak => {
		const vann = stig(stak.home.score, stak.away.score);
		stada[stak.home.name] += vann[0];
		stada[stak.home.name] += vann[1];
	})
	const tbody = teams?.map(stak =>
		[stak.name, stada[stak.name]])
	tbody?.sort((a, b) => b[1] - a[1])
	return tbody
}
