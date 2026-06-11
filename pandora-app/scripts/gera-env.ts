import { writeFile, existsSync, mkdirSync } from 'fs';
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

// This is good for local dev environments, when it's better to
// store a projects environment variables in a .gitignore'd file
require('dotenv').config();

// Would be passed to script like this:
// `ts-node set-env.ts --environment=dev`
// we get it from yargs's argv object
const environment = argv.environment;
const isProd = ((environment === 'prod') || (environment === 'production'));


const folder = './src/environments';
const targetPath = (environment === 'dev' || environment === 'development') ?
  `${folder}/environment.ts`
    : (environment === 'prod' || environment === 'production') ?
    `${folder}/environment.prod.ts`
    : `${folder}/environment.${environment}.ts`;

const API_URL = process.env.API_URL || '';
const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY || 'Definir variavel de ambiente no pandora-app.env';
const GOOGLE_RECAPTCHA_SECRET_KEY = process.env.GOOGLE_RECAPTCHA_SECRET_KEY || 'Definir variavel de ambiente no pandora-app.env'
const PASSWORD_ENCRYPT_AES = process.env.PASSWORD_ENCRYPT_AES || 'Definir variavel de ambiente no pandora-app.env'

const envConfigFile = `
// Este arquivo foi gerado automaticamente pelo script ./scripts/gera-env.ts
// com o objetivo de utilizar de forma automatica as variaveis do sistema

export const environment = {
  production: ${isProd},
  GOOGLE_MAPS_KEY: "${GOOGLE_MAPS_KEY}",
  GOOGLE_RECAPTCHA_SECRET_KEY: "${GOOGLE_RECAPTCHA_SECRET_KEY}",
  API_URL: "${API_URL}",
  PASSWORD_ENCRYPT_AES: "${PASSWORD_ENCRYPT_AES}",
};
`;

if (!existsSync(folder)){
  mkdirSync(folder);
}

writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Arquivos environment.ts gerados em ${targetPath}`);
  }
});
