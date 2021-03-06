import nodemailer from 'nodemailer';
import config from 'config';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import Mail from 'nodemailer/lib/mailer';

export default class Mailer {
	public transporter: Mail

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: config.get('services.mailer.host'),
			port: config.get('services.mailer.port'),
			// secure: config.get('services.mailer.secure'),
			auth: {
				user: config.get('services.mailer.auth.user'),
				pass: config.get('services.mailer.auth.password'),
			},
		});
	}

	private readHtml = (paths: string): Promise<any> => new Promise((resolve, reject) => {
		fs.readFile(paths, {
			encoding: 'utf-8',
		}, (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});

	public verify = ({
		email,
		name,
		link,
	}): Promise<any> => new Promise<any>(async (resolve, reject) => {
		try {
			const html = await this.readHtml(path.join(__dirname, './../../public/emails/account/verification.hbs'));
			const template = await handlebars.compile(html);
			const objectReplacement = {
				email,
				name,
				link,
			};
			const result = await this.transporter.sendMail({
				from: config.get('services.mailer.options.from'),
				subject: `Email Verification - ${name}`,
				to: email,
				html: template(objectReplacement),
			});
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}

export const transporter = (): Promise<Mail> => new Promise<Mail>(async (resolve, reject) => {
	try {
		const result = await nodemailer.createTransport({
			host: config.get('services.mailer.host'),
			port: config.get('services.mailer.port'),
			// secure: config.get('services.mailer.secure'),
			auth: {
				user: config.get('services.mailer.auth.user'),
				pass: config.get('services.mailer.auth.password'),
			},
		});
		resolve(result);
	} catch (error) {
		reject(error);
	}
});
