function gyulHelyProgress() {
    const placeLevel = REF.game_data.village.buildings.place;
    if (placeLevel == '0') {
        // Should be mode=build
        if (!REF.document.location.href.includes('mode=build')) {
            REF = window.open(document.location.href.replace('mode=destroy','mode=build'), 'gyuli');
            return;
        }
        const buildLink = REF.document.querySelector('#main_buildlink_place_1');
        if (buildLink) {
            buildLink.click();
            return;
        }
    } else {
        // Should be mode=destroy
        if (!REF.document.location.href.includes('mode=destroy')) {
            REF = window.open(document.location.href, 'gyuli');
            return;
        }
        const demolishlink = REF.document.querySelector('#building_wrapper img[src*="place1.png"]').closest('tr').querySelector('a.btn');
        if (demolishlink) {
            demolishlink.click();
            return;
        }
    }
    const freeClick = REF.document.querySelector('#buildqueue img[src*="place1.png"]');
    if (freeClick) {
        freeClick.closest('tr').querySelector('a.btn-instant-free').click();
        return;
    }
}
if (!document.location.href.includes('mode=destroy')) {
    alert('Nem itt kéne futtatni, hanem főhadi / bontásba!');
    exit();
}
REF = window.open(document.location.href, 'gyuli');

 

const speed = 1500;
setInterval(()=>gyulHelyProgress(),speed+(Math.random() * (speed/2)));