<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

function temizle($text) {
    $text = strtolower(trim($text));
    $search = ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü'];
    $replace = ['c', 'g', 'i', 'o', 's', 'u'];
    $text = str_replace($search, $replace, $text);
    $text = preg_replace('/\s+/', '-', $text);
    $text = preg_replace('/[^a-z0-9\-]/', '', $text);
    return $text;
}

function getNobetciEczaneler($semt) {
    $semtUrl = temizle($semt);
    $url = "https://www.eczaneler.gen.tr/nobetci-kocaeli-" . $semtUrl;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0");
    $html = curl_exec($ch);
    curl_close($ch);

    if ($html === false) {
        return ["error" => "Sayfa çekilemedi."];
    }

    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    @$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));

    $xpath = new DOMXPath($dom);
    $rows = $xpath->query('//*[@id="nav-bugun"]//tr');

    $eczaneler = [];

    foreach ($rows as $row) {
        $isimNode = $xpath->query('.//div[contains(@class, "col-lg-3")]/a/span', $row);
        $adresNode = $xpath->query('.//div[contains(@class, "col-lg-6")]', $row);
        $telefonNode = $xpath->query('.//div[contains(@class, "col-lg-3") and contains(@class, "py-lg-2")]', $row);

        if ($isimNode->length > 0 && $adresNode->length > 0 && $telefonNode->length > 0) {
            $eczaneler[] = [
                "isim" => trim($isimNode->item(0)->textContent),
                "adres" => trim(preg_replace('/\s+/', ' ', $adresNode->item(0)->textContent)),
                "telefon" => trim($telefonNode->item(0)->textContent)
            ];
        }
    }

    return $eczaneler;
}

$semt = isset($_GET['semt']) ? $_GET['semt'] : null;

if ($semt) {
    $veri = getNobetciEczaneler($semt);
    echo json_encode($veri, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} else {
    echo json_encode(["error" => "Semt parametresi eksik."], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>
