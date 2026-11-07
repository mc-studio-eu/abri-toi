import {getCliClient} from 'sanity/cli'
const client=getCliClient({apiVersion:'2026-10-01'}).withConfig({useCdn:false,perspective:'published'})
console.log(JSON.stringify(await client.fetch('*[_id=="pageAccueil"][0]{hero{photo{...,asset->{_id,url,size,originalFilename,metadata{dimensions}}}}}'),null,2))
