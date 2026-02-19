<?php

/** Получава калкулациите за всички достъпни схеми при зададени, сума, ID # продукт, 
* първоначална вноска. Можете да използвате данните и за визуализиране на резултата в 
* табличен вид, за да може клиента да се запознае с всички възможни схеми. */

/** Входни данни: във вид на php array */
/** 'name': Наименование на функцията */
/** 'unicid': Уникален идентификатор на магазина */
/** 'price': Цена на стоката */
/** 'product_id': ID # на избрания продукт според Вашата система */
/** 'initial_payment': Първоначална вноска */
            
$dskapi_data_all = array(
    'name' => 'getCalculationForAllSchemes',
    'param' => array(
        'unicid' => "xxxxxxxxxxxxxxxxxxxxxxxxx",
        'price' => "1000",
        'product_id' => "xxxxxx",
        'initial_payment' => "0"
    )
);

/** Encript data. Криптиране на входните данни с помоща на получения сертификат */
$dskapi_plaintext = json_encode($dskapi_data_all);
/** Път до файла със сертификата който сте получили */
$dskapi_publicKey = openssl_pkey_get_public(file_get_contents('pub.pem'));
$dskapi_a_key = openssl_pkey_get_details($dskapi_publicKey);
$dskapi_chunkSize = ceil($dskapi_a_key['bits'] / 8) - 11;
$dskapi_output = '';
while ($dskapi_plaintext) {
    $dskapi_chunk = substr($dskapi_plaintext, 0, $dskapi_chunkSize);
    $dskapi_plaintext = substr($dskapi_plaintext, $dskapi_chunkSize);
    $dskapi_encrypted = '';
    if (!openssl_public_encrypt($dskapi_chunk, $dskapi_encrypted, $dskapi_publicKey)) {
        die('Failed to encrypt data');
    }
    $dskapi_output .= $dskapi_encrypted;
}
if (version_compare(PHP_VERSION, '8.0.0', '<')){
    openssl_free_key($dskapi_publicKey);
}
$dskapi_output64 = base64_encode($dskapi_output);
/** Encript data */

/** изпращане на функцията с прикрепените данни към API Service */
$dskapi_ch = curl_init();
curl_setopt_array($dskapi_ch, array(
    CURLOPT_URL => "https://merchantsonline.dskbank.bg/api/index.php",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 2,
    CURLOPT_TIMEOUT => 5,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS =>     json_encode(array('data' => $dskapi_output64)),
    CURLOPT_HTTPHEADER => array(
        "Content-Type: application/json",
        "cache-control: no-cache"
    ),
));
$responseapi = curl_exec($dskapi_ch);
$err = curl_error($dskapi_ch);
curl_close($dskapi_ch);

/** Извличане на резултата от изпълнението на функцията */
$api_obj = json_decode($responseapi);

$dsk_schemes = $api_obj->data->result; // array of objects. Масив от обекти съдържащ видовете схеми със пресметнати стойности
/**
 * foreach ($dsk_schemes as $schema){
 *      $schema->id // Идентификатор на вида схема за която са данните String ('3', '4', '5', '6', '7', '8', '9', '10', '11' '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48')
 *      $schema->name // Наименование на вида схема за която са данните
 *      $schema->default // Дали схемаta за която са данните да се визуализира на клиента като такава по-подразбиране ('Yes', 'No')
 *      $schema->total_price // Обща цена
 *      $schema->initial_payment // Първоначална вноска
 *      $schema->total_loan_amount // Обща размер на кредита
 *      $schema->monthly_payment // Месечна вноска
 *      $schema->total_amount_due // Общо дължима сума
 *      $schema->gpr // ГПР
 *      $schema->glp // ГЛП
 * } 
 */
