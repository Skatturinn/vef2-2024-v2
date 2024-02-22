import { createSchema, dropSchema, end, query } from './lib/db.js';
import { insertData } from './setup/parse.js';


async function main() {
	const games = await query('select * from games');

	console.log(games);
}

async function create() {
	// TODO setja upp gagnagrun + gögn
	const drop = await dropSchema();

	if (drop) {
		console.info('schema dropped');
	} else {
		console.info('schema not dropped, exiting');
		process.exit(-1)
	}
	// await query('CREATE TABLE public.test (test character varying(64) NOT NULL)')
	const result = await createSchema();

	if (result) {
		console.info('schema created');
	} else {
		console.info('schema not created')
	}

	// const data = await readFile('./sql/insert.sql');
	// const insert = await query(data.toString('utf-8'));
	const insert = await insertData()
	if (insert) {
		console.info('data inserted');
	} else {
		console.info('data not inserted');
	}

	await end()
}

create().catch((err) => {
	console.error('Error creating running setup', err);
});

// main().catch((e) => console.error(e));
