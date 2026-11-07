import {getCliClient} from 'sanity/cli'
import {writeFileSync} from 'node:fs'
const client=getCliClient({apiVersion:'2026-10-01'}).withConfig({useCdn:false,perspective:'raw'})
const docs=await client.fetch('*[_type == "article"]')
writeFileSync('../exports/articles-draft-before-2026-11-05.json',JSON.stringify(docs,null,2))
console.log(JSON.stringify(docs.map((d:any)=>({id:d._id,rev:d._rev,titre:d.titre,text:d.corps?.filter((b:any)=>b._type==='block').map((b:any)=>b.children?.map((s:any)=>s.text).join('')).join('\n')})),null,2))
