import { getCliClient } from 'sanity/cli'
import { writeFileSync } from 'node:fs'
const client = getCliClient({apiVersion:'2026-10-01'}).withConfig({useCdn:false,perspective:'raw'})
const docs = await client.fetch('*[_type == "article"]')
writeFileSync('../exports/articles-docx-2026-11-05/before.json', JSON.stringify(docs,null,2))
console.log(JSON.stringify(docs.map((d:any)=>({id:d._id,titre:d.titre,slug:d.slug,seo:d.seo,blocks:d.corps?.length})),null,2))
