import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { currentdate } from '../util/date.js';
import { getGames, listTeams } from './db.js';
import { una } from './users.js';


// Endurnýtum mjög líka validation

export function registrationValidationMiddleware(textField) {
	if (body('name')) {
		return [
			body('name')
				.trim()
				.isLength({ min: 1 })
				.withMessage('Nafn má ekki vera tómt'),
			body('name')
				.isLength({ max: 64 })
				.withMessage('Nafn má að hámarki vera 64 stafir'),
			body(textField)
				.isLength({ max: 400 })
				.withMessage(
					`${textField === 'comment' ? 'Athugasemd' : 'Lýsing'
					} má að hámarki vera 400 stafir`
				),
		];
	}
	return [
		body(textField)
			.isLength({ max: 400 })
			.withMessage(
				`${textField === 'comment' ? 'Athugasemd' : 'Lýsing'
				} má að hámarki vera 400 stafir`
			),
	];
}

// Viljum keyra sér og með validation, ver gegn „self XSS“
export function xssSanitizationMiddleware(textField) {
	if (body('name')) {
		return [
			body('name').customSanitizer((v) => xss(v)),
			body(textField).customSanitizer((v) => xss(v)),
		];
	}
	return [
		body(textField).customSanitizer((v) => xss(v))
	];
}

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

function isDateInRange2Months(value, { req, location, path }) {

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
			.isString()
			.withMessage('Þarf að vera strengur')
			.isLength({ max: 64 })
			.withMessage('Má að hámarki vera 64 stafir')
			.custom(async (stak) => {
				const teams = await listTeams()
				return teams?.includes(stak)
			})
			.withMessage('Ekki tókst að finna heima lið'),
		body('awayname')
			.trim()
			.exists({ values: 'falsy' })
			.isString()
			.withMessage('Þarf að vera strengur')
			.isLength({ max: 64 })
			.withMessage('Má að hámarki vera 64 stafir')
			.custom(async (stak) => {
				const teams = await listTeams()
				return teams?.includes(stak)
			})
			.withMessage('Ekki tókst að finna úti lið'),
		body('homescore')
			.isInt({ min: 0 })
			.withMessage('þarf að vera heiltala stærri en núll'),
		body('awayscore')
			.isInt({ min: 0 })
			.withMessage('þarf að vera heiltala stærri en núll'),
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
		if (!games?.includes(game)) {
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


// .custom((value) => {
// 	if (value > new Date() && value < new Date((new Date()).getFullYear(), -1)) {
// 		return false
// 	}
// 	return true
// })