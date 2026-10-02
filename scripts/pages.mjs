const UA={headers:{'User-Agent':'Mozilla/5.0'}}
const pages=['service/about/','service/shipping-returns/','service/payment-methods/','dealers/','blogs/nieuws/','autohoezen/fabels-feiten/','stalling/','service/']
for(const p of pages){
  const t=await (await fetch('https://www.1classadditions.nl/nl/'+p,UA)).text()
  const m=t.match(/<div[^>]*id="content"[^>]*>([\s\S]*?)<\/footer>/i)||[null,t]
  const txt=m[1].replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim()
  console.log('\n=== '+p+'\n'+txt.slice(0,1800))
}
