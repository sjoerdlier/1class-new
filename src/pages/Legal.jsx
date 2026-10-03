import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CONTACT, FREE_SHIPPING, PROMO, eur } from '../lib.js'
import '../shop.css'

// Routes (hangt App.jsx): /privacy -> Privacy, /voorwaarden -> Voorwaarden, /herroeping -> Herroeping.
// Alleen verifieerbare gegevens staan hier. Ontbrekende bedrijfsgegevens (KvK, btw-nummer, rechtsvorm) staan in OPEN-PUNTEN.md.

function LegalPage({ title, lead, children }) {
  useEffect(() => { document.title = `${title} — 1ClassAdditions` }, [title])
  return (
    <div className="wrap section narrow legal-page">
      <nav className="crumbs" aria-label="Kruimelpad"><Link to="/">Home</Link> / <span>{title}</span></nav>
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      <div className="prose">{children}</div>
    </div>
  )
}

const Contact = () => (
  <p>
    1ClassAdditions, onderdeel van Imparts B.V.<br />
    {CONTACT.address}<br />
    Telefoon: <a href={CONTACT.phoneHref}>{CONTACT.phone}</a><br />
    E-mail: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
  </p>
)

export function Privacy() {
  return (
    <LegalPage title="Privacyverklaring" lead="Hier leest u welke gegevens wij van u vragen, waarvoor wij ze gebruiken en welke rechten u heeft.">
      <h2>Wie is verantwoordelijk?</h2>
      <p>Verantwoordelijk voor de verwerking van uw gegevens op deze website is:</p>
      <Contact />
      <p>Voor vragen over uw gegevens kunt u mailen naar <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p>

      <h2>Geen cookies en geen tracking</h2>
      <p>Deze website gebruikt geen cookies, geen analyse- of marketingdiensten en geen tracking van derden. Uw winkelwagen wordt alleen in uw eigen browser bewaard (lokale opslag), zodat deze behouden blijft als u de pagina verlaat. Die gegevens komen niet bij ons terecht. De lettertypen laden wij vanaf onze eigen website.</p>

      <h2>Bestelaanvraag per e-mail</h2>
      <p>U kunt bij ons geen betaalde bestelling plaatsen via de website. Met &ldquo;Bestelaanvraag opstellen&rdquo; opent uw e-mailprogramma met een kant-en-klaar bericht aan ons. Pas wanneer u die e-mail verstuurt, ontvangen wij uw gegevens.</p>
      <p>Daarin staan de volgende gegevens:</p>
      <ul>
        <li>uw naam, e-mailadres en eventueel uw telefoonnummer;</li>
        <li>uw adres, postcode en woonplaats;</li>
        <li>de producten die u wilt bestellen en eventueel een opmerking.</li>
      </ul>
      <p>Wij gebruiken deze gegevens om uw aanvraag te beantwoorden, uw bestelling te bevestigen, u betaalinstructies te sturen, de bestelling te verzenden en onze administratie te voeren. Dit is nodig om een overeenkomst met u te kunnen voorbereiden en uit te voeren, en om aan wettelijke verplichtingen te voldoen. Facturen en andere administratiegegevens bewaren wij zo lang als de wet voorschrijft (fiscale bewaarplicht, 7 jaar).</p>

      <h2>Contactformulier</h2>
      <p>Het formulier bij Klantenservice werkt op dezelfde manier: er opent een e-mail met uw naam, e-mailadres en bericht. Wij gebruiken die gegevens alleen om uw vraag te beantwoorden.</p>

      <h2>Met wie delen wij gegevens?</h2>
      <ul>
        <li>De vervoerder die uw bestelling bezorgt, ontvangt uw naam en afleveradres.</li>
        <li>Onze hostingpartij (Vercel) verwerkt technische gegevens, zoals uw IP-adres, om de website te tonen en te beveiligen.</li>
      </ul>
      <p>Wij verkopen uw gegevens niet. Let op: e-mail is niet altijd versleuteld. Stuur daarom geen gevoelige gegevens mee die wij niet vragen.</p>

      <h2>Uw rechten</h2>
      <p>U heeft het recht om uw gegevens in te zien, te laten corrigeren of te laten verwijderen, de verwerking te laten beperken, bezwaar te maken en uw gegevens over te laten dragen. Een verzoek kunt u sturen naar <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>. Wij reageren binnen een maand. Wij kunnen u vragen zich te legitimeren.</p>
      <p>Bent u het niet eens met hoe wij met uw gegevens omgaan? Dan kunt u een klacht indienen bij de <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">Autoriteit Persoonsgegevens</a>.</p>
    </LegalPage>
  )
}

export function Voorwaarden() {
  return (
    <LegalPage title="Algemene voorwaarden" lead="Deze voorwaarden gelden voor aanvragen en bestellingen via 1classadditions.nl.">
      <h2>1. Wie zijn wij?</h2>
      <Contact />

      <h2>2. Aanbod en prijzen</h2>
      <p>Alle prijzen op de website zijn in euro&rsquo;s en inclusief btw. Verzendkosten zijn daarin niet opgenomen, tenzij dit bij het product anders staat. Kennelijke vergissingen in prijs of beschrijving binden ons niet.</p>

      <h2>3. Aanvraag en totstandkoming van de overeenkomst</h2>
      <p>Via de website stelt u een bestelaanvraag op. Die verloopt per e-mail: u verstuurt de e-mail die in uw e-mailprogramma opent. Een aanvraag is nog geen bindende bestelling en u betaalt op dat moment niets. Wij bevestigen uw bestelling en de betaalinstructies per e-mail. De overeenkomst komt tot stand zodra wij uw bestelling schriftelijk (per e-mail) hebben bevestigd.</p>

      <h2>4. Verzending en levering</h2>
      <ul>
        <li>Verzending is gratis vanaf een bestelbedrag van {eur(FREE_SHIPPING)}. Daaronder berekenen wij de verzendkosten voor u uit en bevestigen wij die in onze reactie, voordat de overeenkomst tot stand komt.</li>
        <li>Producten die op voorraad zijn en op werkdagen v&oacute;&oacute;r 15:00 uur zijn besteld en betaald, verzenden wij de volgende werkdag. Producten die wij niet op voorraad hebben, worden snel geleverd binnen twee tot zeven werkdagen.</li>
        <li>De levertijd kan langer zijn bij verzending naar het buitenland.</li>
        <li>Meer informatie vindt u op de pagina <Link to="/verzenden">Verzenden &amp; retourneren</Link>.</li>
      </ul>

      <h2>5. Betaling</h2>
      <p>Na onze bevestiging ontvangt u per e-mail hoe u kunt betalen. Wij leveren zodra de betaling volgens de gegeven instructies is geregeld.</p>

      <h2>6. Actiecode</h2>
      <p>Bij bestellingen vanaf &euro; {PROMO.min} geeft de code {PROMO.code} {PROMO.pct}% korting. De korting wordt berekend over het bedrag van de producten (inclusief btw) en niet over verzendkosten.</p>

      <h2>7. Herroepingsrecht</h2>
      <p>Als consument heeft u het recht de overeenkomst binnen 14 dagen zonder opgave van reden te herroepen. Lees alles daarover, inclusief het modelformulier, op de pagina <Link to="/herroeping">Herroepingsrecht en retourneren</Link>.</p>

      <h2>8. Garantie</h2>
      <p>Op onze producten is de wettelijke garantie van toepassing. Staat bij een product een aanvullende garantie van de fabrikant vermeld, dan geldt die naast uw wettelijke rechten.</p>

      <h2>9. Klachten</h2>
      <p>Bent u niet tevreden over een product of onze dienstverlening? Neem dan contact met ons op via <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> of <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>. Wij zoeken samen met u naar een oplossing.</p>

      <h2>10. Privacy</h2>
      <p>Hoe wij met uw gegevens omgaan, leest u in onze <Link to="/privacy">privacyverklaring</Link>.</p>

      <h2>11. Toepasselijk recht</h2>
      <p>Op onze overeenkomsten is Nederlands recht van toepassing.</p>
    </LegalPage>
  )
}

export function Herroeping() {
  return (
    <LegalPage title="Herroepingsrecht en retourneren" lead="Als consument mag u een bestelling binnen 14 dagen zonder opgave van reden herroepen.">
      <h2>Herroepingstermijn</h2>
      <p>U heeft 14 dagen om de overeenkomst te herroepen. De termijn gaat in op de dag nadat u, of een door u aangewezen derde (niet de vervoerder), het product heeft ontvangen. Bestelt u meerdere producten die apart worden bezorgd? Dan gaat de termijn in op de dag nadat u het laatste product heeft ontvangen.</p>

      <h2>Hoe herroept u?</h2>
      <p>Laat ons ondubbelzinnig weten dat u de overeenkomst herroept: per e-mail aan <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>, per post aan het adres hieronder, of met het modelformulier onderaan deze pagina. Gebruik van het formulier is niet verplicht.</p>
      <Contact />

      <h2>Het product terugsturen</h2>
      <p>Stuur het product zonder onnodige vertraging terug, uiterlijk binnen 14 dagen nadat u ons uw herroeping heeft gemeld, naar het adres hierboven. U bent op tijd als u het product terugstuurt voordat die termijn is verstreken. De directe kosten van het terugsturen zijn voor uw rekening. Stuur het product zo mogelijk terug in de originele verpakking.</p>

      <h2>Terugbetaling</h2>
      <p>Wij betalen alle bedragen die wij van u hebben ontvangen terug, inclusief de standaardverzendkosten van de heenzending (niet de extra kosten als u een duurdere bezorgwijze heeft gekozen). Dat doen wij uiterlijk 14 dagen nadat wij uw herroeping hebben ontvangen, met hetzelfde betaalmiddel als waarmee u heeft betaald, tenzij u iets anders met ons afspreekt. Wij mogen wachten met terugbetalen tot wij het product hebben ontvangen of tot u heeft aangetoond dat u het heeft teruggestuurd, al naargelang welk moment eerder valt.</p>
      <p>Heeft u een actiecode gebruikt? Dan betalen wij het bedrag terug dat u daadwerkelijk heeft betaald.</p>

      <h2>Waardevermindering</h2>
      <p>U bent alleen aansprakelijk voor waardevermindering van het product als gevolg van gebruik dat verder gaat dan nodig is om de aard, de eigenschappen en de werking van het product vast te stellen, zoals dat in een winkel ook zou kunnen.</p>

      <h2>Producten waarvoor het herroepingsrecht niet geldt</h2>
      <p>Het herroepingsrecht geldt niet voor producten die volgens uw specificaties zijn gemaakt of die duidelijk persoonlijk van aard zijn, zoals producten die speciaal voor u op maat worden gemaakt.</p>

      <h2>Vragen?</h2>
      <p>Twijfelt u of uw product kan worden teruggestuurd? Bel <a href={CONTACT.phoneHref}>{CONTACT.phone}</a> of mail <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p>

      <h2>Modelformulier voor herroeping</h2>
      <p>Vul dit formulier alleen in en stuur het alleen terug als u de overeenkomst wilt herroepen.</p>
      <div className="formbox">
        <p>Aan: Imparts B.V., {CONTACT.address}, <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
        <p>Ik/Wij* deel/delen* u hierbij mede, dat ik/wij* onze overeenkomst betreffende de verkoop van de volgende producten herroep/herroepen*: ____________________</p>
        <p>Besteld op*/ontvangen op*: ____________________</p>
        <p>Naam consument(en): ____________________</p>
        <p>Adres consument(en): ____________________</p>
        <p>Handtekening consument(en) (alleen wanneer dit formulier op papier wordt ingediend): ____________________</p>
        <p>Datum: ____________________</p>
        <p>(*) Doorhalen wat niet van toepassing is.</p>
      </div>
    </LegalPage>
  )
}
