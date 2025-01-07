$(document).ready(function () {
    // Get Stripe publishable key
    fetch("/pay/config")
        .then((result) => {
            return result.json();
        })
        .then((data) => {
            // Initialize Stripe.js
            const stripe = Stripe(data.publicKey);

            // Event handler
            const subscriptionBtn = document.querySelector("#subscription");
            if (subscriptionBtn != null) {
                document
                    .querySelector("#subscription")
                    .addEventListener("click", () => {
                        // Get Checkout Session ID
                        fetch("/pay/create-checkout-session")
                            .then((result) => {
                                return result.json();
                            })
                            .then((data) => {
                                // Redirect to Stripe Checkout
                                return stripe.redirectToCheckout({
                                    sessionId: data.sessionId
                                });
                            })
                            .then((res) => {
                                console.log(res);
                            });
                    });
            }

            const paymentForm = document.getElementById("purchase");
            if (paymentForm != null) {
                paymentForm.addEventListener("click", async (event) => {
                    event.preventDefault();
                    const selectedProduct = document.getElementById("purchase_id").value;
                    let csrf_token = $("input[name='csrf_token']").val();

                    fetch("/pay/create-checkout-session2", {
                        method: "POST",
                        headers: {
                            'X-CSRFToken': csrf_token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ priceId: selectedProduct }),
                    })
                    .then((result) => {
                        // alert(JSON.stringify(result))
                        return result.json();
                    })
                    .then((data) => {
                        // Redirect to Stripe Checkout
                        // alert(JSON.stringify(data))
                        return stripe.redirectToCheckout({
                            sessionId: data.sessionId
                        });
                    })
                    .then((res) => {
                        console.log(res);
                    });
                });
            }
        });
});
