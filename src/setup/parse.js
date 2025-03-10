import { parse } from 'path';
import { insertGame, insertTeam, listTeams } from '../lib/db.js';
import {
	readFile,
	readFilesFromDir
} from './file.js';
import { nameScoreValidation } from './validation.js';

/**
 * 
 * @param {string} teamsData 
 * @param {Array<string>} files 
 * @returns {Promise<object>}
 */
export async function parseTeamsJson(teamsData, files) {
	let teams;
	try {
		teams = JSON.parse(teamsData);
		if (!teams || typeof teams[Symbol.iterator] !== 'function') {
			return {}
		}
	} catch (e) {
		return {}
	}
	for await (const stak of teams) {
		await insertTeam(stak)
	}
	const teamsObject = await listTeams()
	if (!teamsObject) {
		return false
	}
	for await (const file of files) {
		if (parse(file)?.name.includes('gameday')) {
			const fileContents = await readFile(file);
			const fcJson = fileContents && JSON.parse(fileContents)
			if (!!fcJson?.date
				&& !!fcJson?.games
				&& !Number.isNaN(new Date(fcJson.date).getTime())
				&& fcJson?.date === (new Date(fcJson?.date)).toISOString()) {
				for await (const { home, away } of Array.from(fcJson.games)) {
					const heima = nameScoreValidation(home, teams);
					const uti = nameScoreValidation(away, teams);
					if (heima && uti) {
						// const vann = stig(heima.score, uti.score)
						const heimanr = teamsObject.find(
							(
								stak) => stak.name === heima.name);
						const utinr = teamsObject.find(
							stak => stak.name === uti.name);
						if (heimanr && utinr) {
							await insertGame(
								fcJson.date,
								heimanr.id, heima.score,
								utinr.id, away.score)
						}
					}
				}
			}
		}
	}
	return true
}

export const insertData = async () => {
	const INPUT_DIR = './data';
	const files = await readFilesFromDir(INPUT_DIR);
	const teamsFile = files.find(file => file.includes('teams'));
	const teamsData = typeof teamsFile === 'string' && await readFile(teamsFile);
	let svar = false;
	if (typeof teamsData === 'string') {
		svar = await parseTeamsJson(teamsData, files)
	}
	return svar
}