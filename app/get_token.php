<?php

$code = '';
if (!empty($_GET)) {
    $code = $_GET["code"];

    $ch = curl_init("http://www.example.com/");
    $fp = fopen("example_homepage.txt", "w");

//    $app_id = '153715675051521';
//    $secret = '3f061b3e055e9da0e3eb3cb7e18513d8';
    $app_id = '153719541717801';
    $secret = '68621c281d568b40639a9f2388266869';
    $base_url ='http://local.savorks.com/projects/zoo/takeeasy-2016/app/';

//    $ch = curl_init('https://graph.facebook.com/oauth/access_token?client_id='.$app_id.'&client_secret='.$secret);

     echo "response = ".getAccessToken($app_id, $secret, $base_url, $code);

}
else
{
    echo '';
}




    function get_app_access_token($app_id, $secret) {
        $url = 'https://graph.facebook.com/oauth/access_token';
        $token_params = array(
            "type" => "client_cred",
            "client_id" => $app_id,
            "client_secret" => $secret
        );
        return post_url($url, $token_params);
    }

    function post_url($url, $params) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params, null, '&'));
        $ret = curl_exec($ch);
        curl_close($ch);
        return $ret;
    }

    function getAccessToken($app_id, $secret, $base_url, $code) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://graph.facebook.com/oauth/access_token?'. 'client_id=' . $app_id . '&redirect_uri=' . urlencode($base_url) . '&client_secret=' . $secret . '&code=' . $code);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $r  = curl_exec($ch);
        $r = strstr(str_replace('access_token=', '', $r), '&expires=', true);
        return $r;
    }
?>