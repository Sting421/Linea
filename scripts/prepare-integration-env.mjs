// Node 24+. Prepare local credentials without rotating existing keys or printing them.
import { createECDH, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backendPath = resolve(root, 'services/api/.env');
const webPath = resolve(root, 'apps/web/.env.local');

function readLocal(path, template) {
  const check = spawnSync('git', ['check-ignore', '--quiet', '--no-index', relative(root, path)], {
    cwd: root,
  });
  const tracked = spawnSync('git', ['ls-files', '--error-unmatch', relative(root, path)], {
    cwd: root,
    stdio: 'pipe',
  });
  if (check.status !== 0 || tracked.status !== 1) {
    throw new Error('Credential destination must be ignored and untracked.');
  }
  return existsSync(path)
    ? readFileSync(path, 'utf8')
    : readFileSync(resolve(root, template), 'utf8');
}

function setValue(source, key, value) {
  // Only generated base64url values, a pinned model name, or a validated URI enter here.
  if (!/^[A-Za-z0-9_:\/@.?=&%+~-]+$/.test(value))
    throw new Error('Unsupported configuration characters.');
  const line = `${key}=${value}`;
  const assignment = new RegExp(`^(?:export\\s+)?${key}\\s*=.*$`, 'gm');
  return assignment.test(source)
    ? source.replace(assignment, () => line)
    : `${source.replace(/\s*$/, '')}\n${line}\n`;
}

try {
  let backend = readLocal(backendPath, 'services/api/.env.example');
  let web = readLocal(webPath, 'apps/web/.env.local.example');
  const settings = parseEnv(backend);
  const subjectFlag = process.argv.indexOf('--push-subject');
  const subject =
    settings.WEB_PUSH_SUBJECT || (subjectFlag >= 0 ? process.argv[subjectFlag + 1] : undefined);
  if (!subject) throw new Error('Provide --push-subject with a contact HTTPS URL or mailto URI.');
  const uri = new URL(subject);
  if (!['https:', 'mailto:'].includes(uri.protocol) || uri.username || uri.password) {
    throw new Error('Push subject must be a contact HTTPS URL or mailto URI.');
  }

  const generated = [];
  // Agora generates its project notification secret. A local random value cannot
  // authenticate Agora callbacks and must never be presented as provider setup.
  for (const key of ['LINEA_CUSTOM_LLM_BEARER']) {
    if (!settings[key]) {
      backend = setValue(backend, key, randomBytes(32).toString('base64url'));
      generated.push(key);
    }
  }

  const curve = createECDH('prime256v1');
  let publicKey = settings.WEB_PUSH_PUBLIC_KEY;
  let privateKey = settings.WEB_PUSH_PRIVATE_KEY;
  if (Boolean(publicKey) !== Boolean(privateKey))
    throw new Error('Incomplete push key pair; refusing to rotate it.');
  if (privateKey) {
    if (!/^[A-Za-z0-9_-]{43}$/.test(privateKey) || !/^[A-Za-z0-9_-]{87}$/.test(publicKey)) {
      throw new Error('Push keys must use raw P-256 base64url encoding.');
    }
    curve.setPrivateKey(Buffer.from(privateKey, 'base64url'));
    if (curve.getPublicKey().toString('base64url') !== publicKey)
      throw new Error('Push keys do not match.');
  } else {
    curve.generateKeys();
    publicKey = curve.getPublicKey().toString('base64url');
    privateKey = curve.getPrivateKey().toString('base64url');
    // ECDH can omit leading zero bytes; VAPID private scalars are always 32 bytes.
    privateKey = Buffer.concat([
      Buffer.alloc(32 - curve.getPrivateKey().length),
      curve.getPrivateKey(),
    ]).toString('base64url');
    backend = setValue(backend, 'WEB_PUSH_PUBLIC_KEY', publicKey);
    backend = setValue(backend, 'WEB_PUSH_PRIVATE_KEY', privateKey);
    generated.push('WEB_PUSH_PUBLIC_KEY', 'WEB_PUSH_PRIVATE_KEY');
  }
  if (!settings.WEB_PUSH_SUBJECT) backend = setValue(backend, 'WEB_PUSH_SUBJECT', subject);
  if (!settings.LINEA_SEMANTIC_MODEL)
    backend = setValue(backend, 'LINEA_SEMANTIC_MODEL', 'gpt-4.1-mini-2025-04-14');
  if (!Object.hasOwn(settings, 'OPENAI_API_KEY')) backend += '\nOPENAI_API_KEY=\n';
  const browserPublicKey = parseEnv(web).NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  if (browserPublicKey && browserPublicKey !== publicKey)
    throw new Error('Browser push key differs; resolve it before updating subscriptions.');
  web = setValue(web, 'NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY', publicKey);

  if (!existsSync(backendPath) || readFileSync(backendPath, 'utf8') !== backend)
    writeFileSync(backendPath, backend, { mode: 0o600 });
  if (!existsSync(webPath) || readFileSync(webPath, 'utf8') !== web)
    writeFileSync(webPath, web, { mode: 0o600 });
  console.log(
    generated.length
      ? `Prepared: ${generated.join(', ')}.`
      : 'Existing credentials preserved; push key pair validated.',
  );
  console.log('Only the public push key was copied to the web environment.');
  console.log('Install LINEA_PROVIDER_WEBHOOK_SECRET from Agora Console; local presence is unverified.');
  console.log(
    'Credentials are local preparation only; no provider, delivery, or live mode was enabled.',
  );
} catch (error) {
  // Avoid logging errors from crypto/parsing libraries that could contain secret input.
  const safe = new Set([
    'Credential destination must be ignored and untracked.',
    'Unsupported configuration characters.',
    'Provide --push-subject with a contact HTTPS URL or mailto URI.',
    'Push subject must be a contact HTTPS URL or mailto URI.',
    'Incomplete push key pair; refusing to rotate it.',
    'Push keys must use raw P-256 base64url encoding.',
    'Push keys do not match.',
    'Browser push key differs; resolve it before updating subscriptions.',
  ]);
  console.error(
    safe.has(error.message)
      ? error.message
      : 'Configuration preparation failed; existing credentials were not printed.',
  );
  process.exitCode = 1;
}
