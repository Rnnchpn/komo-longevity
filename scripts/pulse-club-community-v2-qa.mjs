import { readFile } from 'node:fs/promises';

const club=await readFile('site/pulse-v12/club-hub-v1.js','utf8');
const failures=[];
const ok=(label,value)=>{if(!value)failures.push(label);else console.log(`[pulse-club-community-v2] OK · ${label}`)};

ok('Club V2 is the existing single owner',club.includes("const VERSION='2.0.0'")&&club.includes('data-komo-club')&&club.includes("window.KomoClub={open:"));
ok('Club reuses the shared Pulse runtime',club.includes('window.KomoRuntime?.client')&&!club.includes('createClient('));
ok('real account photo uses avatar_path and private signed URL',club.includes('avatar_path')&&club.includes("storage.from('profile-avatars').createSignedUrl"));
ok('verified community role comes from protected RPC',club.includes("rpc('komo_my_community_identity_v1')")&&club.includes('Founder & CEO')===false&&club.includes('kclub-crown'));
ok('Discord configuration is data-driven',club.includes("from('komo_community_settings')")&&club.includes('discord_guild_id')&&club.includes('/widget.json'));
ok('Discord copy keeps health data out of community transport',club.includes('aucune donnée médicale n’est envoyée à Discord'));
ok('community accepts and declines incoming connections',club.includes('data-connection-accept')&&club.includes('data-connection-decline')&&club.includes('respondConnection'));
ok('Club uses Home black and green visual language',club.includes('--kc-bg:#050706')&&club.includes('--kc-green:#7fa58a')&&club.includes('--kc-green-core:#315b41'));
ok('Club is responsive on tablet and phone',club.includes('@media(max-width:900px)')&&club.includes('@media(max-width:640px)')&&club.includes('@media(max-width:390px)'));
ok('Club adds no mutation observer or permanent polling',!club.includes('MutationObserver')&&!club.includes('setInterval('));
ok('Club route actions stay canonical',!club.includes('location.hash=')&&club.includes("KomoPatientNavigation?.go?.('club')"));
ok('motion-safe visual interactions are retained',club.includes('prefers-reduced-motion:reduce'));

if(failures.length){console.error(`[pulse-club-community-v2] FAILED · ${failures.join(' | ')}`);process.exit(1)}
console.log(`[pulse-club-community-v2] PASS · 12/12 Club community assertions`);
