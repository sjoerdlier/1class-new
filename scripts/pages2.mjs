import fs from 'node:fs'
const UA={headers:{'User-Agent':'Mozilla/5.0'}}
const map={over:'service/about/',verzenden:'service/shipping-returns/',feiten:'autohoezen/fabels-feiten/',faq:'service/',dealers:'dealers/',nieuws:'blogs/nieuws/supertex-carcover-voor-ferrari-458-ook-leverbaar-i/',garantie:'service/legal-guarantee-notice/'}
const out={}
for(const [k,p] of Object.entries(map)){
  let t=await (await fetch('https://www.1classadditions.nl/nl/'+p,UA)).text()
  t=t.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,'')
  const s=t.search(/<div class="breadcrumbs|Home\s*\/\s*/i)
  const a=t.indexOf('<div class="col-md-12">',t.indexOf('container content'))
  let body=t.slice(a>0?a:0)
  const e=body.search(/Meld je aan voor onze nieuwsbrief|class="newsletter|<footer/i)
  if(e>0) body=body.slice(0,e)
  body=body.replace(/<(?!\/?(p|strong|b|em|h[1-4]|ul|ol|li|br|a|img)\b)[^>]+>/gi,'').replace(/ (class|style|id|onclick|target|rel|title|alt)="[^"]*"/g,'').replace(/&nbsp;/g,' ').replace(/\s+/g,' ')
  out[k]=body
  console.log(k,body.length,body.slice(0,200))
}
fs.writeFileSync('src/data/pages.json',JSON.stringify(out))
