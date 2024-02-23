import express from 'express';
import { getGames } from '../lib/db.js';
import { stadan } from '../setup/score.js';
import { currentdate } from '../util/date.js';

export const indexRouter = express.Router();

export function una(req) {
	const { user: { username, admin } = {} } = req || {};
	return { username, admin };
}

async function indexRoute(req, res) {
	const loggedIn = req.isAuthenticated();
	const { username, admin } = una(req)
	return res.render('index', {
		title: 'Forsíða',
		time: currentdate(),
		loggedIn,
		username,
		admin
	});
}

async function leikirRoute(req, res) {
	const loggedIn = req.isAuthenticated();
	const games = await getGames();
	return res.render('leikir', {
		title: 'Leikir',
		games,
		time: currentdate(),
		loggedIn
	});
}

async function stadaRoute(req, res) {
	const loggedIn = req.isAuthenticated();
	const stada = await stadan()
	return res.render('stada', {
		title: 'Staðan',
		stadan: stada,
		time: currentdate(),
		loggedIn
	});
}

indexRouter.get('/', indexRoute);
indexRouter.get('/leikir', leikirRoute);
indexRouter.get('/stada', stadaRoute);
