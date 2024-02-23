import { createSchema, dropSchema, end, query } from './lib/db.js';
import { readFile } from './setup/file.js';
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
	const result = await createSchema();
	if (result) {
		console.info('schema created');
	} else {
		console.info('schema not created')
	}
	const insert = await insertData()
	if (insert) {
		console.info('data inserted');
	} else {
		console.info('data not inserted');
	}
	const data = await readFile('./src/sql/insert.sql');
	let insert2;
	if (data) {
		insert2 = await query(data.toString())
	}
	if (insert2) {
		console.info('user inserted');
	} else {
		console.info('user not inserted');
	}
	await end()
}

create().catch((err) => {
	console.error('Error creating running setup', err);
});

// main().catch((e) => console.error(e));
