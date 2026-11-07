import {getCliClient} from 'sanity/cli'
import {writeFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const client=getCliClient({apiVersion:'2026-10-01'}).withConfig({useCdn:false,perspective:'raw'})
const docs=await client.fetch('*[_type == "article" && slug.current == $slug]',{slug:'solution-ombrage-metallique-aluminium'})
assert.equal(docs.length,1,'Unexpected versions')
const doc=docs[0]
const matches=doc.corps.filter((b:any)=>b._type==='block'&&b.style==='h2'&&b.children.map((s:any)=>s.text).join('')==='Références scientifiques')
assert.equal(matches.length,1)
const b=matches[0]
assert.equal(b.children.length,1)
writeFileSync('../exports/bibliographie-before-2026-11-05.json',JSON.stringify(doc,null,2))
const path=`corps[_key==${JSON.stringify(b._key)}].children[0].text`
await client.patch(doc._id).ifRevisionId(doc._rev).set({[path]:'Bibliographie'}).commit({visibility:'sync'})
const after=await client.getDocument(doc._id)
const expected=structuredClone(doc)
expected.corps.find((x:any)=>x._key===b._key).children[0].text='Bibliographie'
for(const key of ['_rev','_updatedAt']){delete expected[key];delete after[key]}
assert.deepEqual(after,expected)
console.log('Verified: Références scientifiques → Bibliographie; all other fields unchanged.')
