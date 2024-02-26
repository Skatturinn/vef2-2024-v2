import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { currentdate } from '../util/date.js';
import { getGames, listTeams } from './db.js';
import { una } from './users.js';


export function sanitizationMiddleware(textField) {
	return [body(textField).trim().escape()];
}

export function userRegistrationValidationMiddleware() {
	return [
		body('username')
			.trim()
			.isLength({ min: 1 })
			.withMessage('Nafn má ekki vera tómt'),
		body('username')
			.isLength({ max: 64 })
			.withMessage('Nafn má að hámarki vera 64 stafir'),
		body('password')
			.trim()
			.isLength({ min: 1 })
			.withMessage('Lykilorð má ekki vera tómt'),
		body('password')
			.isLength({ max: 64 })
			.withMessage('Lykilorð má að hámarki vera 64 stafir'),
	];
}

// Viljum keyra sér og með validation, ver gegn „self XSS“
export function userXssSanitizationMiddleware() {
	return [
		body('username').customSanitizer((v) => xss(v)),
		body('password').customSanitizer((v) => xss(v))
	];
}

export function userSanitizationMiddleware() {
	return [body('username').trim().escape(), body('password').trim().escape()];
}

export function gameRegistrationValidationMiddleware() {
	return [
		body('when')
			.isDate()
			.withMessage('Þarf að vera dagsetning')
			.custom(stak => {
				const dag = new Date(stak);
				return dag <= new Date() && dag >= new Date((new Date()).getFullYear(), -1)
			})
			.withMessage('Dagsetning þarf að vera innan seinustu tveggjamánaða'),
		body('homename')
			.trim()
			.exists({ values: 'falsy' })
			.isInt({ min: 1, max: 12 })
			.withMessage('Þarf að vera löglegt id á liði, bil 1 til 12')
			.custom(async (stak) => {
				const teams = await listTeams()
				return teams?.includes(stak)
			})
			.withMessage('Ekki tókst að finna heima lið'),
		body('awayname')
			.trim()
			.exists({ values: 'falsy' })
			.isInt({ min: 1, max: 12 })
			.withMessage('Þarf að vera löglegt id á liði, bil 1 til 12')
			.custom(async (stak) => {
				const teams = await listTeams()
				return teams?.includes(stak)
			})
			.withMessage('Ekki tókst að finna úti lið'),
		body('homescore')
			.trim()
			.isInt({ min: 0 })
			.withMessage('þarf að vera heiltala stærri en eða jafnt og núll'),
		body('awayscore')
			.trim()
			.isInt({ min: 0 })
			.withMessage('þarf að vera heiltala stærri en eða jafnt og núll'),
		body('admin')
			.custom((stak, { req }) => req.isAuthenticated())
			.withMessage('vantar admin réttindi, vinsamlegast skráðu þig aftur inn')
	]
}

export function gameXssSanitizationMiddleware() {
	return [
		body('when').customSanitizer((v) => xss(v)),
		body('homename').customSanitizer((v) => xss(v)),
		body('awayname').customSanitizer((v) => xss(v)),
		body('homescore').customSanitizer((v) => xss(v)),
		body('awayscore').customSanitizer((v) => xss(v))
	];
}

export async function validationCheckUpdate(req, res, next) {
	const { when, homename, homescore, awayname, awayscore } = req.body;
	const { username, admin } = una(req);

	const teams = await listTeams();
	const games = await getGames();
	const heima = teams?.find(stak => stak.id === Number(homename));
	const uti = teams?.find(stak => stak.id === Number(awayname));


	const validation = validationResult(req);

	const customValidations = [];

	if (heima && uti) {
		const game = {
			date: when,
			home: { name: heima.name, score: homescore },
			away: { name: uti.name, score: awayscore }
		}
		if (games?.includes(game)) {
			customValidations.push({
				param: 'homename',
				msg: 'Leikur er nú þegar til'
			})
		}
	}

	if (homename === awayname) {
		customValidations.push({
			param: 'homename',
			msg: 'Lið bera sama nafn'
		})
	}

	if (!heima) {
		customValidations.push({
			param: 'homename',
			msg: 'Heima lið fannst ekki á skrá',
		});
	}
	if (!uti) {
		customValidations.push({
			param: 'awayname',
			msg: 'Úti lið fannst ekki á skrá',
		});
	}
	const time = currentdate();
	if (!validation.isEmpty() || customValidations.length > 0) {
		return res.render('admin', {
			username,
			time,
			title: 'Umsjónarsíða Admin - villa í innsetningu leiks',
			when,
			homename,
			homescore,
			awayname,
			awayscore,
			errors: validation.errors.concat(customValidations),
			admin,
			teams,
			games
		});
	}

	return next();
}
