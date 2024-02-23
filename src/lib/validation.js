import { body } from 'express-validator';
import xss from 'xss';

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
		// body(textField).customSanitizer((v) => xss(v)),
	];
}

export function userSanitizationMiddleware() {
	return [body('username').trim().escape(), body('password').trim().escape()];
}

export function isUrlValid(string) { // uppfært fall ur v1
	try {
		const a = new URL(string);
		return !!a;
	} catch {
		return false;
	}
}