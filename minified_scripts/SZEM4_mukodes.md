# Mi SZEM4?

SZEM a legújabb, 4. generációs farmoló bot, mely közel teljes önműködésre képes. Neked csupán meg kell adni hogy mely falukból milyen egységeket használhat, valamint hogy mik a farmok amiket támadni szeretnél, és a többit elintézi: Jelentéseket elemezve felderíti a bányaszintet így képes lesz precízen támadni, valamint szól és jelöl ha valami probléma adódik. Mindezen dolgokat, és minden állapotot képes le is menteni, így legközelebbi futtatásnál onnan folytathatod ahol abbahagyta!
Emellett képes figyelni a bejövő támadások számát, valamint építeni is tud egy általad felépített (vagy az alapértelmezett) sorrend alapján.

# Beállítások

Habár működése nagyban önálló, nem árt beállítani egysmást. Az egyes mezőre téve az egered megjelenik a jobb felső sarokban a súgó, mit jelentenek az adott mezők. A támadás gyakoriságára a Menetrend sor szolgál, ahol tul. képp azt állítod be, hogy hány percenként támadjon rá SZEM. Ez jól működik ha már ismert a bányaszint - addig viszont nem árt a "Termelés/óra"-t megadni, mekkora termelést gondolsz a felderítetlen falukban. A menetrend és a termelés függvényében érdemes lehet a Min sereg/falu-t is állítani, de ha 4-et beírsz (=1 kl), azzal is boldogan ellesz, hisz idő alapon támad, nem egységszám alapján.
Ha félsz a játék bot detektáló rendszerétől, jól teszed. SZEM próbálja szimulálni az emberi működést: támad amíg tud, majd ha minden elfogyott elmegy pihenni, viszont egy agyament gyors 1 lovas támadások küldése folyamatosan nem gyengén feltűnő bot tevékenység! Te hogy támadnál ha ezt saját kézzel csinálnád? A Sebesség alatt állítsd be mennyi időre menjen pihenni, és milyen gyakran kattintgasson - ezt nyugodtan emelheted 3000ms-ig is.
A jelentés elemző beállításai is hasznosak! Ha a zöld jelentéseket hagyod neki kitörölni, "átlapoz" következő oldalakra is, amit magától nem tenne! Külföldi szerverek esetében a fordítás megadása szükséges.

# Hogyan farmol? Elmélyülés a támadási algoritmusban

Célpontválasztás: SZEM végignézi a farmjaid, és ha valamelyikben úgy véli, hogy a menetrend szerinti minimum nyersanyagot meg tudná kaparintani, akkor keres hozzá egy támadó falut a tieid közül. Ha úgy véli hogy ebben a farmban több mint 5x annyi nyersanyagot képes lopni mint a megadott maximális időlimit, akkor azonnal elkezd rá támadni a legközelebbi elérhető faluból. Ellenben tovább megy a listán, és keresi, melyik az a farm-falu páros, amelyik a legközelebb van egymáshoz.

Mennyi nyers lehet a faluban? A harci jelentés megmondja az adott faluban milyen bányaszintek vannak, és mennyi az ott talált nyersanyag. SZEM figyelembe veszi, hogy amíg oda ér a sereged, a nyersanyag termelődik. A felderített ott hagyott nyersanyagban ugyan eléggé megbízik (alapértelmezett 3 óráig fogja úgy venni hogy rabolható), de a termelés által létrejött nyersen már nem annyira (Menetrend / alapértelmezett 60 perc). SZEM sejtése a potenciális nyersanyagra tehát ezek összege: talált nyersanyag (max 3 órára visszamenőleg) + termelésből adódó nyersanyag (max 60 perc). Ha a feltételezett nyersanyag eléri a minimális időtávot, melyet a Menetrendbe megadtál (alapértelmezett 30 perc), támadást indít a falura ha az ehhez szükséges sereg mennyisére eléri a Min sereg/falu számát. Ha ezt nem éri el, úgy még több nyerset vár, de ha már a max (alap 60 perc)-be is belenyúlik, azaz több nyerset lehetetlen hogy feltételezzen, úgy egy olyan sereggel indul útnak, ami a Min sereg/falu számát kielégíti, de egyben az is biztos hogy nem lesz 100%-os a fosztás eredménye. (pl. 40 min/sereg, 100 nyers/óra, 30-60p esetén 60p után a keletkező 100 nyersre 5 kl-t indít el)

Az algoritmus: SZEM egy folyamatos "vonat"-ot próbál felállítani. Számításba vesz minden támadást amiről tud, és 1 farmra minél szorosabban próbálja azt tartani is. Példán keresztül jobb ezt megérteni: Van egy farm, ahol **1000 nyers termelődik/óra**, és **20-40 perc** a menetrended. Ha talál egy falut ami mondjuk 50 percre van a célponttól nehézlovasokkal, akkor mivel még nincs rá menő támadás, így feltételezi, hogy a maximális, 40 percnyi termelést el tudja hozni, így indít rá 14 nehézlovast. Később, akár ugyanabból a faluból megpróbálkozik más egységtípussal is számolni (nehézló->könnyűló->kardos->lándzsás). Ha egy lándzsás útideje 100 perc, az egy újbóli helyes párosítást eredményez, hisz a nehézlovas 50 perc múlva ér be, így újból 50 perces lefedetlen terület van az útidőben. Így tehát mivel a max megbízhatóság 40 perc, ismét a maximum, 40 percnyi termelésért (azaz 666 nyersért) indul, immáron 27 lándzsással (vagy 67 bárddal inkább). Ha ezután talál egy másik falut, ami 110 percre van, azt fogja látni hogy előtte van egy lovas támadás ami 40 percet lefed 50p távról, majd egy gyalogos ami szintén 40 percet 100p távról, - azaz neki 110 percről már csupán 10 percnyi termelésért tudna menni. Ez, mivel kevesebb mint a minimális menetrendünk (20 perc), nem támad rá, viszont ha 10 perc múlva újra vizsgálja ezt a párosítást, akkor az már 20 percnyi termelést jelent, ami már egy kielégítő feltétel hogy rátámadjon, és mondjuk lovast indítson a feltételezett 333 nyersért -> 4kl. Az így küldött egyes támadások a szerelvények, melyeket neked vizuálisan is ábrázol, sorrendbe, falunként, így pontos áttekintést kapsz egy oldalon minden farmra milyen támadás milyen céllal megy.

Összegzés: Számodra ez egy játék a számokkal, amit a menetrend állításával tudsz játszani. A tól-ig rendszer segítségével nagyon jó, pontos lefedést tudsz elérni, hogy minden nyersért ott legyél pont annyivel és pont akkor amennyivel kell, mégis ne állj naívan a dolgokhoz, hogy azt hidd a több órája nem támadott farmod megvárt a termeléssel. Minél jobban megbízol a farmokba és nagyobb számot írsz a menetrendbe, annál kevesebb támadás küldődik ki, ami nem kelti a feltűnést, és jobban túléli a falat is, viszont könnyen be furakodhat melléd más, ami rontja a hatékonyságot.

# SZEM4 Firebase Auth
NEM KÖTELEZŐ. Több gép használata esetén javasolt. SZEM4 képes adataidat felhőben tárolni a [Google Firebase](https://console.firebase.google.com/u/0/) rendszerbe. Ehhez neked kell ide regisztrálni és létrehozni egy applikációt, melynek eredménye képp ki fogja dobni a szükséges credentials-öket.
Ezután létre kell hoznod bent egy Firestore Database-t (Rules-be írd át: "allow read, write: if request.auth != null"), majd egy tetszőleges "collection" és "document"-et. Ezen neveit add hozzá a credentials objecthez "collection" és "myDocument" név alatt.
Ezután engedélyezni kell az email alapú authentikációt. Ha megvan, végy fel egy fiókot, és az email/jelszó párost illeszd az előzőleg megadott credentials objecthez "email" és "password" mezőként.
Az így kapott objectet vedd fel a "szem_firebase" nevű localStorage-be, stringify-olva. Végén egy ilyesmi parancsot kell futtatni:
```
localStorage.setItem('szem_firebase',JSON.stringify({
    apiKey: "t0TalLYr4NdOMiDoFAN4P1K3y",
    authDomain: "szem4-12345.firebaseapp.com",
    projectId: "szem4-12345",
    storageBucket: "szem4-12345.appspot.com",
    messagingSenderId: "123456789123",
    appId: "1:123456789012:web:123456789abcdef1234567",
    email: "yourname@domain.com",
    password: "myPassword",
    collection: "szem4Collection",
    myDocument: "documentName"
}));
```