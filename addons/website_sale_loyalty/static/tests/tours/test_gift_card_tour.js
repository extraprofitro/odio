/** @odoo-module **/

import tour from 'web_tour.tour';
import tourUtils from 'website_sale.tour_utils';

tour.register('shop_sale_gift_card', {
    test: true,
    url: '/shop?search=Small%20Drawer'
},
    [
        {
            content: 'Open customize menu',
            extra_trigger: '.oe_website_sale .o_wsale_products_searchbar_form',
            trigger: '#customize-menu > a',
        },
        {
            content: "Enable 'Show # found' if needed",
            trigger: '#customize-menu label:contains(Show # found)',
            run: function () {
                if (!$('#customize-menu label:contains(Show # found) input').prop('checked')) {
                    $('#customize-menu label:contains(Show # found)').click();
                }
            }
        },
        // Add a small drawer to the order (50$)
        {
            content: 'select Small Drawer',
            extra_trigger: '.oe_search_found',
            trigger: '.oe_product_cart a:contains("TEST - Small Drawer")',
        },
        {
            content: 'Add Small Drawer into cart',
            trigger: 'a:contains(ADD TO CART)',
        },
            tourUtils.goToCart(1),
        {
            content: 'open customize menu',
            extra_trigger: '.oe_website_sale .oe_cart',
            trigger: '#customize-menu > a',
        },
        {
            content: 'enable "Promo Code" if needed',
            trigger: '#customize-menu label:contains(Promo Code)',
            run: function () {
                if (!$('#customize-menu label:contains(Promo Code) input').prop('checked')) {
                    $('#customize-menu label:contains(Promo Code)').click();
                }
            }
        },
        {
            content: 'Click on "I have a promo code"',
            extra_trigger: '.show_coupon',
            trigger: '.show_coupon',
        },
        {
            content: 'insert gift card code',
            extra_trigger: 'form[name="coupon_code"]',
            trigger: 'form[name="coupon_code"] input[name="promo"]',
            run: 'text GIFT_CARD'
        },
        {
            content: 'validate the git card',
            trigger: 'form[name="coupon_code"] .a-submit',
        },
        {
            content: 'check gift card line',
            trigger: '.td-product_name:contains("PAY WITH GIFT CARD")',
        },
        {
            content: 'Click on "I have a promo code"',
            extra_trigger: '.show_coupon',
            trigger: '.show_coupon',
        },
        {
            content: 'insert gift card code',
            extra_trigger: 'form[name="coupon_code"]',
            trigger: 'form[name="coupon_code"] input[name="promo"]',
            run: 'text 10PERCENT'
        },
        {
            content: 'validate the git card',
            trigger: 'form[name="coupon_code"] .a-submit',
        },
        {
            content: 'check gift card amount',
            trigger: '.oe_currency_value:contains("-45.00")',
            trigger: '.oe_website_sale .oe_cart',
            run: function () {}, // it's a check
        },
        {
            content: 'go to shop',
            trigger: 'a:contains("Shop")',
        },
        {
            content: "type Gift Card in search",
            trigger: 'form input[name="search"]',
            run: "text Gift Card",
        },
        {
            content: "start search",
            trigger: 'form:has(input[name="search"]) .oe_search_button',
        },
        {
            content: "select Gift Card",
            extra_trigger: '.oe_search_found', // Wait to be on search results or it sometimes throws concurent error (sent search form + click on product on /shop)
            trigger: '.oe_product_cart a:containsExact("TEST - Gift Card")',
        },
        {
            content: "click on 'Add to Cart' button",
            trigger: "a:contains(ADD TO CART)",
        },
            tourUtils.goToCart(2),
        {
            content: 'check gift card amount',
            trigger: '.oe_currency_value:contains("-45.00")',
            trigger: '.oe_website_sale .oe_cart',
            run: function () {}, // it's a check
        },
    ],
);
