/**
 * Created by Zhen Wang on 16/6/17.
 * this function is for increasing and decreasing number of product that will be added
 * to cart in Product Page
 */

$(function() {
    $(document).on('click', '#increase_button_productpage', function(e) {
        e.preventDefault();
        console.log("++");
        //get values
        var price = parseFloat($('#priceValue_productpage').val());
        var quantity = parseInt($('#quantity_productpage').val());

        //update values
        price += parseFloat($('#unitPrice_productpage').val());
        quantity += 1;

        $('#quantity_productpage').val(quantity);
        $('#priceValue_productpage').val(price.toFixed(2));
        $('#total_number_productpage').html(quantity);
    });

    $(document).on('click', '#decrease_button_productpage', function(e) {
        e.preventDefault();
        var priceValue = parseFloat($('#priceValue_productpage').val());
        var quantity = parseInt($('#quantity_productpage').val());


        if (quantity == 1) {
            priceValue = $('#unitPrice_productpage').val();
            quantity = 1;
        } else {
            priceValue -= parseFloat($('#unitPrice_productpage').val());
            quantity -= 1;
        }

        $('#quantity_productpage').val(quantity);
        $('#priceValue_productpage').val(priceValue.toFixed(2));
        $('#total_number_productpage').html(quantity);
    });

    $(document).on("click", "#confirm-payment", function(event){
        window.location.href = "/payment";
    });
});
