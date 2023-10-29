function clickPlay() {
    jQuery(document).ready(function(e) {
        jQuery("#start").hide();
        jQuery("#menu_3").show();
    });
}

function clickBack_3() {
    jQuery(document).ready(function(e) {
        jQuery("#start").show();
        jQuery("#menu_3").hide();
    });
}


function clickPlayer_3() {
    jQuery(document).ready(function(e) {
        jQuery("#menu_2").show();
        jQuery("#menu_3").hide();
    });
}

function clickAi_3() {
    jQuery(document).ready(function(e) {
        jQuery("#menu").show();
        jQuery("#menu_3").hide();
    });
}

function clickBack() {
    jQuery(document).ready(function(e) {
        jQuery("#menu_3").show();
        jQuery("#menu").hide();
    });
}

function clickBack2() {
    jQuery(document).ready(function(e) {
        jQuery("#menu_3").show();
        jQuery("#menu_2").hide();
    });
}