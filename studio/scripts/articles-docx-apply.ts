import {getCliClient} from 'sanity/cli'
import {readFileSync, writeFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const root='../exports/articles-docx-2026-11-05/'
const patches=JSON.parse(readFileSync(root+'patches.json','utf8'))
const before=JSON.parse(readFileSync(root+'before.json','utf8'))
const client=getCliClient({apiVersion:'2026-10-01'}).withConfig({useCdn:false,perspective:'raw'})
assert.equal(patches.length,3)
const ids=patches.map((p:any)=>p.id)
assert.equal(new Set(ids).size,3)
const current=await client.fetch('*[_type == "article" && (_id in $ids || _id in $drafts)]',{ids,drafts:ids.map((id:string)=>'drafts.'+id)})
assert.equal(current.length,3,'Unexpected draft or missing article; stop to avoid overwriting editorial work')
let tx=client.transaction()
for(const p of patches){
 assert.equal(current.find((d:any)=>d._id===p.id)?._rev,p.revision,'Concurrent update detected')
 tx=tx.patch(p.id,(patch:any)=>patch.ifRevisionId(p.revision).set(p.set))
}
const result=await tx.commit({visibility:'sync'})
const after=await client.fetch('*[_type == "article"]')
writeFileSync(root+'after.json',JSON.stringify(after,null,2)+'\n')
for(const old of before){
 const updated=after.find((d:any)=>d._id===old._id)
 assert.ok(updated)
 const patch=patches.find((p:any)=>p.id===old._id)
 if(!patch){assert.deepEqual(updated,old);continue}
 for(const [field,value] of Object.entries(patch.set))assert.deepEqual(updated[field],value)
 for(const field of Object.keys(old).filter(k=>!Object.hasOwn(patch.set,k)&&!['_rev','_updatedAt'].includes(k)))assert.deepEqual(updated[field],old[field])
}
assert.equal(before.length,after.length)
const report={transactionId:result.transactionId,verified:true,articles:patches.map((p:any)=>({id:p.id,slug:p.slug,titre:p.set.titre,blocks:p.set.corps.length})),otherArticlesUnchanged:true}
writeFileSync(root+'result.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2))
