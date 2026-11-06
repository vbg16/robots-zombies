'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const version=JSON.parse(fs.readFileSync('version.json','utf8')),html=fs.readFileSync('index.html','utf8');
assert.ok(Number.isInteger(version.build)&&version.build>0);
for(const [file,pattern] of [
 ['index.html',/BUILD\s+(\d+)\s+·\s+DESENVOLVIMENTO/],
 ['README.md',/^# Screwvivors — BUILD (\d+)/],
 ['docs/contrato-atual.md',/^# Contrato vigente — Screwvivors BUILD (\d+)/],
 ['docs/README.md',/Protótipo atual BUILD(\d+)/],
 ['docs/plano-integracao-20-minutes-till-dawn.md',/Estado vigente — BUILD (\d+)/]
]){const match=fs.readFileSync(file,'utf8').match(pattern);assert.ok(match,'Version label missing: '+file);assert.equal(Number(match[1]),version.build,'Stale version label: '+file);}
if(version.channel==='development')assert.equal(version.publicApproved,false,'Development must not imply public approval');
for(const [,src] of html.matchAll(/\bsrc="([^"]+)"/g)){assert.ok(!/^(https?:)?\/\//.test(src),'Offline runtime resource must be local: '+src);assert.ok(fs.existsSync(path.resolve(src.split('?')[0])),'Missing ZIP resource: '+src);}
console.log('Release labels, local HTML resources and development approval flag agree with BUILD'+version.build+'.');
