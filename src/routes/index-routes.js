import express from 'express';
import { getGames } from '../lib/db.js';
import { currentdate } from '../util/date.js';

export const indexRouter = express.Router();

async function indexRoute(req, res) {
	return res.render('index', {
		title: 'Forsíða',
		time: currentdate(),
	});
}

async function leikirRoute(req, res) {
	const games = await getGames();
	console.log(games)
	return res.render('leikir', {
		title: 'Leikir',
		games,
		time: currentdate(),
	});
}

async function stadaRoute(req, res) {
	return res.render('stada', {
		title: 'Staðan',
		time: currentdate(),
	});
}

indexRouter.get('/', indexRoute);
indexRouter.get('/leikir', leikirRoute);
indexRouter.get('/stada', stadaRoute);
