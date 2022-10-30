import { TokenDB } from '../typings/type.js';
import { tokendb } from './database.js';

export async function CheckTokenExpired(res: TokenDB | undefined) {
	if (!res) return;
	const now = new Date().getTime();
	const authat = new Date(res.timestamp).getTime();
	if (now - authat >= 31556952000) {
		await tokendb.run(`DELETE FROM accounts WHERE Discord="${res.Discord}"`);
	} else return;
}
