import { LegalPage } from "@/components/LegalPage";
import { useLanguage } from "@/contexts/LanguageContext";

const RefundPolicy = () => {
  const { language } = useLanguage();
  const isEs = language === "es";

  return (
    <LegalPage
      title={isEs ? "Política de Reembolsos y Cancelación" : "Refund & Cancellation Policy"}
      lastUpdated={isEs ? "26 de abril, 2026" : "April 26, 2026"}
    >
      {isEs ? <Es /> : <En />}
    </LegalPage>
  );
};

const En = () => (
  <>
    <p>
      This Policy explains how subscriptions, free trials, refunds, and cancellations work for{" "}
      <strong>Hagion AI</strong>. By subscribing you confirm that you have read and accepted these
      terms together with our <a href="/terms">Terms of Service</a>.
    </p>

    <h3>1. Subscription Plans</h3>
    <p>
      Hagion AI offers three monthly subscription tiers — <strong>Premium</strong>,{" "}
      <strong>Premium Plus</strong>, and <strong>Pro</strong>. Pricing and features are described
      on the Premium page. Subscriptions are billed in advance for each billing period and renew
      automatically until cancelled.
    </p>

    <h3>2. Free Trial</h3>
    <p>
      We may offer a <strong>3-day free trial</strong> to first-time subscribers. To start a trial
      you must provide a valid payment method. If you do not cancel before the end of the trial,
      your payment method will be automatically charged the regular price for the plan you selected
      and the subscription will renew on the standard cycle.
    </p>
    <p>
      Trial eligibility is determined per user/account. Repeat trials may not be available. Stripe
      and Google Play may apply additional eligibility checks.
    </p>

    <h3>3. Auto-Renewal</h3>
    <p>
      <strong>All subscriptions renew automatically.</strong> The price in effect at the time of
      renewal will be charged to your payment method. We will email you a receipt after each
      successful charge. If a charge fails, we may attempt to re-charge or downgrade your access
      until payment is resolved.
    </p>

    <h3>4. How to Cancel</h3>
    <h4>Web subscriptions (Stripe)</h4>
    <p>
      Open the Premium page and click your active plan to access the Stripe Billing Portal, where
      you can cancel, switch plans, or update your payment method. Cancellation takes effect at
      the end of the current billing period; you keep access until then.
    </p>
    <h4>Mobile subscriptions (Google Play)</h4>
    <p>
      Open the Google Play Store → Profile → Payments &amp; subscriptions → Subscriptions → Hagion
      AI → Cancel subscription. Google Play handles cancellations and refunds for in-app purchases
      according to its own policies.
    </p>
    <h4>Mobile subscriptions (Apple App Store)</h4>
    <p>
      Open Settings → [Your Name] → Subscriptions → Hagion AI → Cancel.
    </p>

    <h3>5. Refunds</h3>
    <p>
      <strong>All sales are final.</strong> Subscription fees, including renewal charges, are
      <strong> non-refundable</strong> after a billing period has begun, except where required by
      applicable law (for example, certain consumer-protection laws in the EU/UK that grant a
      14-day right of withdrawal — note that this right may be waived once digital content has
      been delivered, and use of the Service may constitute delivery).
    </p>
    <p>
      We do not provide partial refunds for unused time, downgrades, or feature changes during a
      billing period.
    </p>

    <h3>6. Refund Requests</h3>
    <p>
      You may request a refund by emailing{" "}
      <a href="mailto:support@hagionai.com">support@hagionai.com</a> with your account email,
      transaction date, and reason. We review requests case-by-case as a courtesy and reserve the
      right to grant or deny at our sole discretion. Granted refunds are returned to the original
      payment method within 5–10 business days.
    </p>

    <h3>7. App Store / Play Store Purchases</h3>
    <p>
      <strong>Refunds for purchases made through Apple App Store or Google Play must be requested
      directly from those stores</strong> — we do not have the ability to process refunds for
      transactions we did not handle. See:
    </p>
    <ul>
      <li>Apple: <a href="https://support.apple.com/en-us/HT204084" target="_blank" rel="noopener noreferrer">reportaproblem.apple.com</a></li>
      <li>Google: <a href="https://support.google.com/googleplay/answer/2479637" target="_blank" rel="noopener noreferrer">play.google.com</a> → Order history → Request refund</li>
    </ul>

    <h3>8. Chargebacks</h3>
    <p>
      Initiating a chargeback or payment dispute without first contacting us may result in
      immediate suspension or termination of your account. Please email us first — we will work
      with you in good faith.
    </p>

    <h3>9. Price Changes</h3>
    <p>
      We may change subscription prices with at least 30 days' notice. Price changes apply to
      future billing periods. If you do not agree with a new price, cancel before it takes effect.
    </p>

    <h3>10. Account Deletion &amp; Subscriptions</h3>
    <p>
      Deleting your account from Settings schedules permanent deletion 30 days later. If you have
      an active subscription, it will be set to cancel at the end of the current billing period;
      no refund is issued for the unused portion. To delete immediately and forfeit remaining
      access, follow the prompts in Settings.
    </p>

    <h3>11. Contact</h3>
    <p>
      Hagion AI · Texas, United States ·{" "}
      <a href="mailto:support@hagionai.com">support@hagionai.com</a>
    </p>
  </>
);

const Es = () => (
  <>
    <p>
      Esta Política explica cómo funcionan las suscripciones, las pruebas gratuitas, los reembolsos
      y las cancelaciones de <strong>Hagion AI</strong>. Al suscribirte, confirmas que has leído y
      aceptado estos términos junto con nuestros{" "}
      <a href="/terms">Términos de Servicio</a>.
    </p>

    <h3>1. Planes de suscripción</h3>
    <p>Hagion AI ofrece tres niveles mensuales: <strong>Premium</strong>,{" "}
    <strong>Premium Plus</strong> y <strong>Pro</strong>. Las suscripciones se facturan por
    adelantado y se renuevan automáticamente hasta que se cancelen.</p>

    <h3>2. Prueba gratuita</h3>
    <p>Podemos ofrecer una <strong>prueba gratuita de 3 días</strong> a nuevos suscriptores. Para
    iniciar una prueba debes proporcionar un método de pago válido. Si no cancelas antes del fin de
    la prueba, se te cobrará automáticamente el precio regular y la suscripción se renovará en el
    ciclo estándar.</p>

    <h3>3. Renovación automática</h3>
    <p><strong>Todas las suscripciones se renuevan automáticamente.</strong> El precio vigente al
    momento de la renovación se cargará a tu método de pago. Si un cobro falla, podemos intentar
    cobrar nuevamente o reducir tu acceso hasta resolver el pago.</p>

    <h3>4. Cómo cancelar</h3>
    <h4>Suscripciones web (Stripe)</h4>
    <p>Abre la página Premium y haz clic en tu plan activo para acceder al Portal de Facturación
    de Stripe, donde puedes cancelar, cambiar de plan o actualizar tu método de pago. La
    cancelación entra en vigor al final del periodo actual; conservas acceso hasta entonces.</p>
    <h4>Suscripciones móviles (Google Play)</h4>
    <p>Abre Google Play Store → Perfil → Pagos y suscripciones → Suscripciones → Hagion AI →
    Cancelar suscripción.</p>
    <h4>Suscripciones móviles (Apple App Store)</h4>
    <p>Abre Ajustes → [Tu nombre] → Suscripciones → Hagion AI → Cancelar.</p>

    <h3>5. Reembolsos</h3>
    <p><strong>Todas las ventas son finales.</strong> Las tarifas de suscripción, incluidas las
    renovaciones, <strong>no son reembolsables</strong> después de iniciado un periodo de
    facturación, salvo que la ley aplicable lo exija (por ejemplo, ciertos derechos de retracto de
    14 días en la UE/UK; este derecho puede renunciarse una vez entregado el contenido digital, y el
    uso del Servicio puede constituir entrega).</p>
    <p>No emitimos reembolsos parciales por tiempo no utilizado, cambios de plan o reducciones
    durante el periodo de facturación.</p>

    <h3>6. Solicitudes de reembolso</h3>
    <p>Puedes solicitar un reembolso enviando un correo a{" "}
    <a href="mailto:support@hagionai.com">support@hagionai.com</a> con tu correo de cuenta, fecha
    de transacción y motivo. Revisamos las solicitudes caso por caso como cortesía y nos reservamos
    el derecho a otorgar o denegar a nuestra entera discreción.</p>

    <h3>7. Compras en App Store / Play Store</h3>
    <p><strong>Los reembolsos de compras realizadas a través de Apple App Store o Google Play
    deben solicitarse directamente a esas tiendas</strong> — no podemos procesar reembolsos de
    transacciones que no manejamos.</p>

    <h3>8. Contracargos</h3>
    <p>Iniciar un contracargo sin contactarnos primero puede resultar en la suspensión o
    terminación inmediata de tu cuenta. Por favor escríbenos primero — trabajaremos contigo de
    buena fe.</p>

    <h3>9. Cambios de precio</h3>
    <p>Podemos cambiar los precios con al menos 30 días de aviso. Los cambios se aplican a
    periodos de facturación futuros. Si no estás de acuerdo, cancela antes de la fecha de
    vigencia.</p>

    <h3>10. Eliminación de cuenta y suscripciones</h3>
    <p>Eliminar tu cuenta desde Configuración programa la eliminación permanente 30 días después.
    Si tienes una suscripción activa, se cancelará al final del periodo actual; no se emite
    reembolso por la porción no utilizada.</p>

    <h3>11. Contacto</h3>
    <p>Hagion AI · Texas, Estados Unidos ·{" "}
    <a href="mailto:support@hagionai.com">support@hagionai.com</a></p>
  </>
);

export default RefundPolicy;
