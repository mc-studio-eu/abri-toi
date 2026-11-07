import {getCliClient} from 'sanity/cli'
import {writeFileSync} from 'node:fs'
const c=getCliClient({apiVersion:'2026-10-01'}).withConfig({useCdn:false,perspective:'published'})
const docs=await c.fetch('*[_type in ["pageAccueil","produit","article","pageAPropos","pageRealisations"]]')
const assets=await c.fetch('*[_type=="sanity.imageAsset"]{_id,originalFilename,metadata{dimensions}}')
const images:any[]=[]
function walk(v:any,path:string,id:string){if(!v||typeof v!=='object')return;if(v.asset?._ref||v.src)images.push({id,path,src:v.src,ref:v.asset?._ref});for(const [k,x] of Object.entries(v))walk(x,path+'.'+k,id)}
for(const d of docs)walk(d,'',d._id)
writeFileSync('../exports/images-sanity-audit.json',JSON.stringify({images,assets},null,2))
console.log(JSON.stringify({images:images.length,withBoth:images.filter(i=>i.src&&i.ref),local:images.filter(i=>i.src&&!i.ref)},null,2))
