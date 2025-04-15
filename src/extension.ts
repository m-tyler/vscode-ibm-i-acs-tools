import * as vscode from 'vscode';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('acstools.ibmiRunSqlFromAcs', async (p1) => {
		const config = vscode.workspace.getConfiguration("ibm-i-acs")

		// Run the ACS plugin for SQL
		let host: string = config.get('host') || ''
		const database: string = config.get('database') || ''
		const acsbinary: string = config.get('acsbinary') || ''

		if (acsbinary <= '') {
			vscode.window.showInformationMessage('You need to configure the ACS executable "IBM i ACS Tools" ')
			return
		}

		host = await pickHost(host, 'SQL scripts');

		let cmd = (acsbinary.endsWith('.jar') ? `java -jar ${acsbinary}` : `${acsbinary}`);
		cmd += ` /plugin=rss /autorun=0  /file="${p1.path ? p1.path : ``}"`;

		if (host > '') {
			cmd += ` /system=${host} `
		}

		if (database > '') {
			cmd += ` /database=${database}  `
		}

		const rc = cp.exec(cmd, (err: any, stdout: string, stderr: string) => {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (err) {
				console.log('error: ' + err);
			}
		});
	});
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('acstools.ibmiRunDebuggerInAcs', async (p1) => {
		// Run the ACS plugin 
		const config = vscode.workspace.getConfiguration("ibm-i-acs")

		let host: string = config.get('host') || ''
		let acsbinary: string = config.get('acsbinary') || ''
		let user: string = config.get('user') || ''
		let database: string = config.get('database') || ''

		if (acsbinary <= '') {
			vscode.window.showInformationMessage('You need to configure the ACS executable "IBM i ACS Tools" ')
			return
		}
		host = await pickHost(host, 'the System Debugger');
		let cmd = (acsbinary.endsWith('.jar') ? `java -jar ${acsbinary}` : `${acsbinary}`);

		cmd = cmd + ` /plugin=sysdbg `;

		if (host > '') {
			cmd += ` /system=${host} `
		}
		if (user > '') {
			cmd += ` /user=${user} `
		}
		if (database > '') {
			cmd += ` /database=${database}  `
		}

		const rc = cp.exec(cmd, (err: any, stdout: string, stderr: string) => {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (err) {
				console.log('error: ' + err);
			}
		});
	});
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('acstools.ibmiRunDb2toolsInAcs', async (p2) => {
		// Run the ACS plugin 
		const config = vscode.workspace.getConfiguration("ibm-i-acs")

		let host: string = config.get('host') || ''
		let acsbinary: string = config.get('acsbinary') || ''
		let database: string = config.get('database') || ''
		let schema: string = config.get('schema') || ''

		if (acsbinary <= '') {
			vscode.window.showInformationMessage('You need to configure the ACS executable "IBM i ACS Tools" ')
			return
		}

		host = await pickHost(host, 'the Database Tools');

		let cmd = (acsbinary.endsWith('.jar') ? `java -jar ${acsbinary}` : `${acsbinary}`);

		cmd = cmd + ` /plugin=db2tools  `;
		if (host > '') {
			cmd += ` /system=${host} `
		}

		if (database > '') {
			cmd += ` /database=${database}  `
		}
		if (schema > '') {
			cmd += ` /schema=${schema}  `
		}

		const rc = cp.exec(cmd, (err: any, stdout: string, stderr: string) => {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (err) {
				console.log('error: ' + err);
			}
		});
	});
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('acstools.initAcsTools', async (p2) => {
		// Get from config old style IDS
		var configold = vscode.workspace.getConfiguration("ibm-i-run-sql-from-acs")
		let host: string = configold.get('host') || ''
		let acsjar: string = configold.get('acsjar') || ''
		let schema: string = configold.get('schema') || ''
		
		// New the ACS plugin config
		const config = vscode.workspace.getConfiguration("ibm-i-acs")
		
		// apply these values to new style IDS
		config.update('ibm-i-acs.host', host);
		console.log(`ibm-i-acs.host:`, host);
		config.update('ibm-i-acs.acsbinary', acsjar);
		console.log(`ibm-i-acs.acsbinary:`, acsjar);
		config.update('ibm-i-acs.schema', schema);
		console.log(`ibm-i-acs.schema:`, schema);
		
		//rmeove old IDs from config - NOPE incase someone runs this acstools and the original version
		// config.update('ibm-i-run-sql-from-acs.host', `undefined`, true);
		// config.update('ibm-i-run-sql-from-acs.acsjar', `undefined`, true);
		// config.update('ibm-i-run-sql-from-acs.schema', `undefined`, true);
	});
	context.subscriptions.push(disposable);
	vscode.commands.executeCommand('acstools.initAcsTools')
	console.log(`Congratulations, acstools "${context.extension.packageJSON.description}", "Version" :"${context.extension.packageJSON.version}" is now active!`);
}

// this method is called when your acstools is deactivated
export function deactivate() { }

async function pickHost(host: string, feature: string): Promise<string> {
	let hosts = host.split(',')
	// let host: string ='';
	if (hosts.length > 1) {
		hosts.forEach((v, i, a) => a[i] = a[i].trim())
		const newhost = await vscode.window.showQuickPick(hosts, { placeHolder: `IBM i Host name for running ${feature}.` })
		if (!newhost) return ''
		host = newhost || ''
	}
	return host;
}