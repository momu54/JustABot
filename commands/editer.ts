import {
	ActionRowBuilder,
	AttachmentBuilder,
	AutocompleteInteraction,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	codeBlock,
	EmbedBuilder,
	ModalBuilder,
	ModalSubmitInteraction,
	SlashCommandAttachmentOption,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { createProject, ts } from '@ts-morph/bootstrap';
import { editerlanguages, GithubCache, GithubEtags } from '../type.js';
const githubrepocache: GithubCache = {};
const githubrepoetags: GithubEtags = {};
const githubusercache: GithubCache = {};
const githubuseretags: GithubEtags = {};

export const data = new SlashCommandBuilder()
	.setName('editer')
	.setDescription('Code editor commands.')
	.addSubcommand(
		new SlashCommandSubcommandBuilder()
			.setName('create')
			.setDescription('Create a new code editer instance.')
			.addStringOption(
				new SlashCommandStringOption()
					.setName('language')
					.setDescription('Language to use for the code editor.')
					.setRequired(true)
					.addChoices({
						name: 'typescript',
						value: 'ts',
					})
					.addChoices({
						name: 'python',
						value: 'py',
					})
					.addChoices({
						name: 'javascript',
						value: 'js',
					})
			)
	)
	.addSubcommand(
		new SlashCommandSubcommandBuilder()
			.setName('loadfile')
			.setDescription('Read code file.')
			.addAttachmentOption(
				new SlashCommandAttachmentOption()
					.setName('file')
					.setDescription('File to load.')
					.setRequired(true)
			)
	)
	.addSubcommand(
		new SlashCommandSubcommandBuilder()
			.setName('loadfromgithub')
			.setDescription('Load from the github repository.')
			.addStringOption(
				new SlashCommandStringOption()
					.setName('username')
					.setDescription('Github username')
					.setRequired(true)
			)
			.addStringOption(
				new SlashCommandStringOption()
					.setName('repository')
					.setDescription('Repository')
					.setRequired(true)
					.setAutocomplete(true)
			)
			.addStringOption(
				new SlashCommandStringOption()
					.setName('path')
					.setDescription('Github file path')
					.setRequired(true)
					.setAutocomplete(true)
			)
	);

export async function execute(i: ChatInputCommandInteraction) {
	const subcmd = i.options.getSubcommand();
	if (subcmd == 'create') {
		const language = i.options.getString('language', true) as editerlanguages;
		await CreateEditer(i, language);
	} else if (subcmd == 'loadfile') {
		const Attachment = i.options.getAttachment('file', true);
		const contentType = Attachment.contentType;
		let language: editerlanguages;
		switch (contentType) {
			case 'video/MP2T; charset=utf-8':
				language = editerlanguages.ts;
				break;
			case 'text/x-python; charset=utf-8':
				language = editerlanguages.js;
				break;
			case 'application/javascript; charset=utf-8':
				language = editerlanguages.py;
				break;
			default:
				const errembed = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle('error!')
					.setDescription(
						'This command only supports typescript, JavaScript, and python.\nIf there is no problem with the file, please confirm whether the encoding format is UTF-8.'
					);
				await i.reply({ embeds: [errembed], ephemeral: true });
				return;
		}
		const res = await fetch(Attachment.url);
		const file = await res.arrayBuffer();
		const filecontent = Buffer.from(file).toString('utf8');
		await CreateEditer(i, language, filecontent);
	} else if (subcmd == 'loadfromgithub') {
	}
}

async function CreateEditer(
	i: ChatInputCommandInteraction,
	language: editerlanguages,
	code?: string
) {
	const embed = new EmbedBuilder()
		.setColor(0xffffff)
		.setTitle(`editer: ${language}`)
		.setDescription(codeBlock(code ? language : '', code || ''))
		.setFooter({
			text: `${
				code ? '' : 'This code block has nothing.\n'
			}Detection problem only works with typescript.`,
		});
	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setEmoji('✏️')
				.setCustomId(`editer.edit.${language}`)
				.setStyle(ButtonStyle.Primary)
		)
		.addComponents(
			new ButtonBuilder()
				.setEmoji('💾')
				.setCustomId(`editer.save.${language}`)
				.setStyle(ButtonStyle.Success)
		)
		.addComponents(
			new ButtonBuilder()
				.setEmoji('❌')
				.setCustomId('editer.destroy')
				.setStyle(ButtonStyle.Danger)
		);
	await i.reply({ embeds: [embed], components: [row] });
}

export async function executeBtn(i: ButtonInteraction) {
	const args = i.customId.split('.');
	const action = args[1];
	const language = args[2];
	const code = i.message.embeds[0]
		.description!.replaceAll('```', '')
		.replace(`${language}\n`, '');
	if (action == 'edit') {
		const modal = new ModalBuilder()
			.setTitle(`editer: ${language}`)
			.setCustomId(`editer.editmodal.${language}`)
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setLabel('code')
						.setCustomId('editer.code')
						.setRequired(true)
						.setStyle(TextInputStyle.Paragraph)
						.setMaxLength(4000)
						.setValue(code)
				)
			);
		await i.showModal(modal);
	} else if (action == 'save') {
		const modal = new ModalBuilder()
			.setTitle(`save code`)
			.setCustomId(`editer.savemodal.${language}`)
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setLabel('file name')
						.setCustomId('editer.save.filename')
						.setRequired(true)
						.setStyle(TextInputStyle.Short)
				)
			);
		await i.showModal(modal);
	} else if (action == 'destroy') {
		await i.message.delete();
	}
}

export async function executeModal(i: ModalSubmitInteraction) {
	const args = i.customId.split('.');
	const action = args[1];
	const language = args[2];
	if (action == 'editmodal') {
		const code = i.fields.getTextInputValue('editer.code');
		const embed = new EmbedBuilder()
			.setColor(0xffffff)
			.setTitle(`editer: ${language}`)
			.setDescription(codeBlock(language, code))
			.setFooter({
				text: `Detection problem only works with typescript.`,
			});
		await i.deferUpdate();
		// Check typescript
		if (language == 'ts') {
			const proj = await createProject({ useInMemoryFileSystem: true });
			const file = proj.createSourceFile('dummy.ts', code);
			const program = proj.createProgram();
			const diagnostics = ts.getPreEmitDiagnostics(program);
			for (const diagnostic of diagnostics) {
				const pos = ts.getLineAndCharacterOfPosition(file, diagnostic.start!);
				embed.setFields([
					{
						name: 'PROBLEMS',
						value: codeBlock(
							language,
							`${
								embed.data.fields?.[0].value
									.replaceAll('```', '')
									.replace(language, '') || ''
							}(line ${pos.line + 1}:${pos.character + 1}) ${
								diagnostic.code
							}: ${diagnostic.messageText}`
						),
					},
				]);
			}
		}
		await i.message?.edit({ embeds: [embed] });
	} else if (action == 'savemodal') {
		const msg = i.message!;
		const code = msg.embeds[0]
			.description!.replaceAll('```', '')
			.replace(`${language}\n`, '');
		const filename = i.fields.getTextInputValue('editer.save.filename');
		const AttachmentData = Buffer.from(code);
		const Attachment = new AttachmentBuilder(AttachmentData, {
			name: `${filename}.${language}`,
		});
		await i.reply({ files: [Attachment], ephemeral: true });
	}
}

export async function executeAutoComplete(i: AutocompleteInteraction) {
	const forcused = i.options.getFocused(true);
	const username = i.options.getString('username', false);
	let jsonres: any[];
	if (forcused.name == 'repository') {
		const repoinput = forcused.value;
		if (!username) {
			await i.respond([]);
			return;
		}
		const res = await fetch(`https://api.github.com/users/${username}/repos`, {
			headers: {
				Authorization: `Basic ${Buffer.from(
					`${process.env.githubclientid}:${process.env.githubclientsecret}`
				).toString('base64')}`,
				'If-None-Match': githubuseretags[username],
			},
		});
		if (res.status == 304) {
			jsonres = githubusercache[`${username}`];
		} else if (!res.ok) {
			await i.respond([]);
			return;
		} else {
			jsonres = (await res.json()) as any[];
			githubusercache[`${username}`] = jsonres;
			githubuseretags[`${username}`] = res.headers.get('ETag')!;
		}
		const filteredchoices = jsonres.filter(
			(repo, index) =>
				(repo.name.toLowerCase().includes(repoinput.toLowerCase()) ||
					!repoinput) &&
				index < 25
		);
		const choices = filteredchoices.map((repo) => ({
			name: repo.name as string,
			value: repo.name,
		}));
		await i.respond(choices);
		return;
	} else if (forcused.name == 'path') {
		const repo = i.options.getString('repository', false);
		const pathinput = forcused.value;
		console.log(pathinput);
		if (!repo || !username) {
			await i.respond([]);
			return;
		}
		if (pathinput.endsWith('/')) {
			const res = await fetch(
				`https://api.github.com/repos/${username}/${repo}/contents/${pathinput}`,
				{
					headers: {
						Authorization: `Basic ${Buffer.from(
							`${process.env.githubclientid}:${process.env.githubclientsecret}`
						).toString('base64')}`,
					},
				}
			);
			const rawres = await res.json();
			console.log(rawres);
			if (!res.ok || (rawres.type || 'dir') != 'dir') {
				await i.respond([]);
				return;
			} else {
				jsonres = rawres;
			}
			const filteredchoices = jsonres.filter((_, index) => index < 25);
			console.log(filteredchoices);
			const choices = filteredchoices.map((file) => ({
				name: file.path as string,
				value: `${file.type};${
					file.download_url ? file.download_url : file.url
				}`.replace(`https://raw.githubusercontent.com/${username}/${repo}/`, ''),
			}));
			console.log(choices);
			await i.respond(choices);
			return;
		} else {
			const res = await fetch(
				`https://api.github.com/repos/${username}/${repo}/contents`,
				{
					headers: {
						Authorization: `Basic ${Buffer.from(
							`${process.env.githubclientid}:${process.env.githubclientsecret}`
						).toString('base64')}`,
						'If-None-Match': githubrepoetags[`${username}.${repo}`],
					},
				}
			);
			if (res.status == 304) {
				jsonres = githubrepocache[`${username}.${repo}`];
			} else if (!res.ok) {
				await i.respond([]);
				return;
			} else {
				jsonres = (await res.json()) as any[];
				githubrepocache[`${username}.${repo}`] = jsonres;
				githubrepoetags[`${username}.${repo}`] = res.headers.get('ETag')!;
			}
			const filteredchoices = jsonres.filter(
				(file, index) =>
					(file.name.toLowerCase().includes(pathinput.toLowerCase()) ||
						!pathinput) &&
					index < 25
			);
			const choices = filteredchoices.map((file) => ({
				name: file.name as string,
				value: `${file.type};${file.download_url ? file.download_url : file.url}`,
			}));
			await i.respond(choices);
			return;
		}
	}
}
