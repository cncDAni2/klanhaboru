# Mi SZEM4?

SZEM a legújabb, 4. generációs farmoló bot, mely közel teljes önműködésre képes. Neked csupán meg kell adni hogy mely falukból milyen egységeket használhat, valamint hogy mik a farmok amiket támadni szeretnél, és a többit elintézi: Jelentéseket elemezve felderíti a bányaszintet így képes lesz precízen támadni, valamint szól és jelöl ha valami probléma adódik. Mindezen dolgokat, és minden állapotot képes le is menteni, így legközelebbi futtatásnál onnan folytathatod ahol abbahagyta!
Emellett képes figyelni a bejövő támadások számát, valamint építeni is tud egy általad felépített (vagy a alapértelmezett) sorrend alapján.

# Beállítások

Habár működése nagyban önálló, nem árt beállítani egysmást. Az egyes mezőre téve az egered megjelenik a jobb felső sarokban a súgó, mit jelentenek az adott mezők. A legfontosabb beállítás a Határszám, ez határozza meg hogy milyen gyakran, milyen kis csapatokat küldjön el SZEM. Kl-eket feltételezve, ha 1 lovassával szeretnéd kockáztatni a támadásaid, akkor ez ~75 legyen, de ha egy 1-es falat még túl szeretnéd élni, javasolt a 240. Amíg nincsenek jelentések állítsd be a "Termelés/óra"-t is.
Ha félsz a játék bot detektáló rendszerétől, jól teszed. SZEM próbálja szimulálni az emberi működést: támad amíg tud, majd ha minden elfogyott elmegy pihenni, viszont egy agyament gyors 1 lovas támadások küldése folyamatosan nem gyengén feltűnő bot tevékenység! Te hogy támadnál ha ezt saját kézzel csinálnád? A Sebesség alatt állítsd be mennyi időre menjen pihenni, és milyen gyakran kattintgasson - ezt nyugodtan emelheted 3000ms-ig is.
A jelentés elemző beállításai is hasznosak! Ha a zöld jelentéseket hagyod neki kitörölni, "átlapoz" következő oldalakra is, amit magától nem tenne! Külföldi szerverek esetében a fordítás megadása is hasznos dolog.

# Hogyan farmol? Elmélyülés a támadási algoritmusban

Célpontválasztás: SZEM végignézi a farmjaid, és ha valamelyikben úgy véli, hogy a határszámnyi nyersanyagot meg tudná kaparintani, akkor keres hozzá egy támadó falut a tieid közül. Ha úgy véli hogy ebben a farmban több mint 5x annyi nyersanyagot képes lopni mint a megadott határszám, akkor azonnal elkezd rá támadni a legközelebbi elérhető faluból. Ellenben tovább megy a listán, és keresi, melyik az a farm-falu páros, amelyik a legközelebb van egymáshoz.

Mennyi nyers lehet a faluban? A harci jelentés megmondja az adott faluban milyen bányaszintek vannak, és mennyi az ott talált nyersnyag. SZEM figyelembe veszi, hogy amíg oda ér a sereged, a nyersanyag teremtődik. A felderített ott hagyott nyersanyagban ugyan eléggé megbízik (alapértelmezett 3 óráig fogja úgy venni hogy rabolható), de a termelés által létrejött nyersen már nem annyira (alapértelmezett 20 perc). SZEM sejtése a potenciális nyersanyagra tehát ezek összege: talált nyersanyag (max 3 órára visszamenőleg) + termelésből adódó nyersanyag (max 20 perc). Ha ez nem éri el a határszámot, akkor vár, és kénytelen lesz a termelésből adódó nyersanyagra jobban alapozni, így megvárni a 30-40, vagy akár még több időt, mire keletkezik határszámnyi nyersanyag.

Az algoritmus: SZEM egy folyamatos "vonat"-ot próbál felállítani. Számításba vesz minden támadást amiről tud, és 1 farmra minél szorosabban próbálja azt tartani is. Példán keresztül jobb ezt megérteni: Van egy farm, ahol **1000 nyerstermelődik/óra**, és **300-as a határszámod**. Ez azt jelenti, hogy **18 perc**enként kell rá egy támadás, ami elviszi a 300 nyerset. Tehát a falura 3 "szerelvény" tart, és 1 szerelvény lefed egy 18 perces intervallumot. Ha van két szerelvény között 30-40 perces hely is, és időközben egy közelebbi falu elérhető válik ami ezt a lukat be tudja tömni, akkor SZEM onnan is rá indít még 1 szerelvényt! Minden ilyen támadást lejegyez magának, innen tudja az állapotokat minden farmra. A szerelvény minimum hossza a határszámod, de pl. a 300 nyersanyagért küldött 4 könnyűlovas 320 nyersanyagot is képes elvinni;valamint mivan ha már pl. egy órája nem támadtál a farmra, és 1000 nyersanyag lehet ott? Erre van a "Megbízhatóság", ami limitálja az egyes szerelvény hosszát: ha ez a példa esetében 30 perc, akkor első támadás a falura 30 percnyi, azaz 500 nyersanyagnak megfelelő mennyiségű sereget küld el rá, amihez 7 könnyűló kell. A 7 lovas viszont 560 nyersanyagot is képes elhozni, de mivel nem bízol meg abban hogy ennyit el is hoz, így maximum 30 perces szerelvényt hoz létre. Később aztán 18 perc után újra eléri a 300-as határszámodat, 4 lovast ráküld, 320-as teherbírással, viszont ha azonnali ráküldés, akkor SZEM fogja tudni, hogy itt 20 felesleg van, így a szerelvény hossza ez esetben a 300 nyers termelési ideje = 18 perc. A jelentés elemző által felderített nyersanyagért menő sereg külön számolódik: ha felderítésed **5000 otthagyott nyers**ből szól, amihez 63 ló kellene, de pl. csak 50-et tud ráküldeni, akkor SZEM ezt úgy jegyzi, hogy 4000-et elhoztál a felderített nyersanyagok közül, viszont a szerelvény hossza 0, mert az oda útig járó nyersre nem jutott sereg. Ha viszont van lovad, akkor 5000+megbízhatóság (30 perc) nyersért indul, azaz 5500-ért, ami 67 lovas, és egy 30 perces szerelvényt fog eredményezni. Igen: a "megbízhatóság" csak a termésre vonatkozik. A felderített nyersben sokkal jobban megbízik, de nem ruházódik át a termelésre, azaz ha az említett faluig 4 órás út vezet, akkor is küldi max 67 lovast,  és csak 67-et: nem érdekli az sem hogy útközbe +4000 extra nyers termelődhet, viszont a jelentés elavulása (alapértelmezett 3 óra) sem érvényes ilyenkor.

Összegzés: Számodra ez egy játék a számokkal, amit a megbízhatóság és határszám állításával tudsz játszani. Minél jobban megbízol a faluban, annál jobb és szorosabb szerelvényeket fog küldeni SZEM, viszont könnyen lehet hogy a túlzott bizakodás feleslegesen küldött egységet is jelent, főleg ha már rég támadtál egy falura (pl. egy friss reggeli indításnál). A kisebb határszám pedig több gyorsabb támadásokat eredményez ami sokkal hatékonyabb, de a legkisebb fal is már komoly károkat okozhat, valamint egyre nagyobb aktivitást jelent ami gyanúsabb a játék számára.

# SZEM4 Firebase Auth
SZEM4 képes adataidat felhőben tárolni a [Google Firebase](https://console.firebase.google.com/u/0/) rendszerbe. Ehhez neked kell ide regisztrálni és létrehozni egy applikációt, melynek eredménye képp ki fogja dobni a szükséges credentials-öket.
Ezután létre kell hoznod bent egy Firestore Database-t (Rules-be írd át: "allow read, write: if request.auth != null"), majd egy tetszőleges "collection" és "document"-et. Ezen neveit add hozzá a credentials objecthez "collection" és "myDocument" név alatt.
Ezután engedélyezni kell az email alapú authentikációt. Ha megvan, végy fel egy fiókot, és az email/jelszó párost illeszd az előzőleg megadott credentials objecthez "email" és "password" mezőként.
Az így kapott objectet vedd fel a "szem_firebase" localStorage-be, stringify-olva. Végén egy ilysmi parancsot kell futtatni:
```
localStorage.setItem('szem_firebase',JSON.stringify({
apiKey: "t0TalLYr4NdOMiDoFAN4P1K3y",
authDomain: "szem4-12345.firebaseapp.com",
projectId: "szem4-12345",
storageBucket: "szem4-12345.appspot.com",
messagingSenderId: "123456789123",
appId: "1:123456789012:web:123456789abcdef1234567',
email: "youname@domain.com",
password: 'myPassword,
collection: "szem4Collection",
myDocument: "documentName"
}));
```