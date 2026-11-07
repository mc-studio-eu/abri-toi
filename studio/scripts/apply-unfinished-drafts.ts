import {getCliClient} from 'sanity/cli'
import {readFileSync,writeFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const client=getCliClient({apiVersion:'2026-10-01'}).withConfig({useCdn:false,perspective:'raw'})
const before=JSON.parse(readFileSync('../exports/articles-draft-before-2026-11-05.json','utf8'))
const unfinished=(d:any)=>d.corps?.length===1&&d.corps[0].children?.map((s:any)=>s.text).join('').trim()==='Article en cours de rédaction.'
const targets=before.filter((d:any)=>!d._id.startsWith('drafts.')&&unfinished(d))
assert.equal(targets.length,5)
const current=await client.fetch('*[_type=="article"]')
assert.deepEqual(current,before,'Content changed since backup')
console.log('Passing to draft:',targets.map((d:any)=>d.titre))
await client.action(targets.map((d:any)=>({actionType:'sanity.action.document.unpublish',publishedId:d._id,draftId:'drafts.'+d._id})))
const after=await client.fetch('*[_type=="article"]')
writeFileSync('../exports/articles-draft-after-2026-11-05.json',JSON.stringify(after,null,2))
const content=(d:any)=>Object.fromEntries(Object.entries(d).filter(([k])=>!['_id','_rev','_createdAt','_updatedAt'].includes(k)))
for(const d of targets){
 assert.ok(!after.some((a:any)=>a._id===d._id),'Published version still present')
 const draft=after.find((a:any)=>a._id==='drafts.'+d._id)
 assert.ok(draft,'Missing draft')
 const previousDraft=before.find((a:any)=>a._id===draft._id)
 assert.deepEqual(content(draft),content(previousDraft||d))
}
for(const d of before.filter((d:any)=>!targets.some((t:any)=>d._id===t._id||d._id==='drafts.'+t._id)))assert.deepEqual(after.find((a:any)=>a._id===d._id),d)
console.log(JSON.stringify({verified:true,drafts:targets.map((d:any)=>d.titre),published:after.filter((d:any)=>!d._id.startsWith('drafts.')).length}))
