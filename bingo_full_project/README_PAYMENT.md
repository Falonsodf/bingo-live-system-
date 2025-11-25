
# Integración de Pagos - Guía rápida

## PayPal (recomendado para pagos internacionales)
- Usa PayPal Checkout (v2) con SDK JS.
- Documentación oficial: https://developer.paypal.com/sdk/js/ and https://developer.paypal.com/api/rest/

### Ejemplo rápido (client + server)
Client:
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD"></script>
<div id="paypal-button-container"></div>
<script>
paypal.Buttons({
  createOrder: (data, actions) => actions.order.create({
    purchase_units: [{ amount: { value: '5.00' } }]
  }),
  onApprove: (data, actions) => actions.order.capture().then(details => {
    console.log('Pago completado', details);
  })
}).render('#paypal-button-container');
</script>

Server (Node.js) - usar SDK o llamadas a /v2/checkout/orders.

## Yape / Plin (Perú) - opciones prácticas
- Yape no publica una API pública para cobros directos tipo merchant (usa Yape Empresa para comercios). Ver: https://www.yape.com.pe/productos/yape-empresa and MercadoPago Yape integration docs.
- Plin ofrece soluciones para comercios vía alianzas bancarias y gateways (Izipay, integradores).
- Recomendación práctica: integrar un gateway local (Izipay, PayULatam, MercadoPago) que soporte cobro con Yape/Plin o generar QR de cobro en la pasarela.

Referencias:
- MercadoPago Yape integration: https://www.mercadopago.com.pe/developers/en/docs/checkout-api/integration-configuration/yape
- Izipay developers: https://developers.izipay.pe/

## Recomendación
Para el Bingo en vivo, usa PayPal para jugadores internacionales y MercadoPago / Izipay para jugadores en Perú (configurar cobros con Yape/Plin si tu gateway lo soporta). Mantén comprobantes y automatiza la verificación en tu backend.
