import sqlite3 from 'sqlite3';
import * as sqlite from 'sqlite';

export const tokendb = await sqlite.open({
	filename: './database/githubaccount.db',
	driver: sqlite3.Database,
	mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
});
