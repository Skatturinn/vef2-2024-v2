import bcrypt from 'bcrypt';

export async function comparePasswords(password, user) {
	const ok = await bcrypt.compare(password, user.password);

	if (ok) {
		return user;
	}

	return false;
}

async function createValidationCheck(req, res, next) {
	const validation = validationResult(req);
	const customValidations = ['Villa við að stofna notenda'];
	if (!validation.isEmpty()) {
		throw new Error(validation.errors.concat(customValidations))
	}
}

async function createAccount(req, res) {
	const { username, password, king } = req.body
	try {
		createValidationCheck(req, res)
		await createUser(username, password, king)
	} catch (err) {
		const message = err;
		return res.render('register', { message, title: 'Nýskráning' })
	}
	return res.redirect('/')
}
