(function () {
  'use strict';

  const locale = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  const CART_KEY = 'asolution_cart_v2';
  const IDEMPOTENCY_KEY = 'asolution_checkout_idempotency_v1';

  let cart = [];
  let products = [];
  let variants = [];
  let settings = null;
  let isSubmitting = false;

  try {
    cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    cart = [];
  }

  const labels = locale === 'ar'
    ? {
        empty: 'السلة فارغة',
        subtotal: 'المجموع',
        vat: 'الضريبة',
        shipping: 'الشحن',
        total: 'الإجمالي',
        discount: 'الخصم',
        invalid: 'راجع البيانات المطلوبة.',
        success: 'تم إنشاء طلبك بنجاح.',
        ref: 'رقم الطلب',
        sending: 'جاري إنشاء الطلب...',
        offline: 'تعذر الاتصال بالخادم.',
        cod: 'الدفع عند الاستلام',
        bank: 'تحويل بنكي',
        invoice: 'فاتورة / دفع يدوي',
        online: 'دفع إلكتروني'
      }
    : {
        empty: 'Your cart is empty.',
        subtotal: 'Subtotal',
        vat: 'VAT',
        shipping: 'Shipping',
        total: 'Total',
        discount: 'Discount',
        invalid: 'Please review the required details.',
        success: 'Your order has been created.',
        ref: 'Order reference',
        sending: 'Creating your order...',
        offline: 'Could not reach the server.',
        cod: 'Cash on delivery',
        bank: 'Bank transfer',
        invoice: 'Invoice / manual',
        online: 'Online payment'
      };

  const esc = (s) =>
    String(s ?? '').replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        })[c]
    );

  function productBySlug(slug) {
    return products.find((p) => p.slug === slug);
  }

  function variantById(id) {
    return variants.find((v) => v.id === id);
  }

  function itemPrice(item) {
    const product = productBySlug(item.id);
    const variant = item.variantId ? variantById(item.variantId) : null;
    return Number(variant?.price ?? product?.price ?? 0);
  }

  function subtotal() {
    return cart.reduce(
      (sum, item) =>
        sum + itemPrice(item) * Number(item.qty || 0),
      0
    );
  }

  function money(value) {
    return new Intl.NumberFormat(
      locale === 'ar' ? 'ar-SA' : 'en-SA',
      {
        style: 'currency',
        currency: settings?.currency || 'SAR'
      }
    ).format(Number(value) || 0);
  }

  function physicalItems() {
    return cart.filter(
      (item) => productBySlug(item.id)?.type === 'physical'
    );
  }

  function estimateShipping(sub) {
    if (!physicalItems().length) return 0;

    const method =
      document.querySelector('[name=shipping_method]')?.value;

    if (method === 'pickup') return 0;

    const threshold = Number(
      settings?.free_shipping_threshold || 0
    );

    if (threshold && sub >= threshold) return 0;

    return Number(settings?.flat_shipping_rate || 0);
  }

  function renderSummary() {
    const box = document.querySelector('#summary');

    if (!box) return;

    if (!cart.length) {
      box.innerHTML = `<p>${labels.empty}</p>`;
      return;
    }

    const sub = subtotal();
    const shipping = estimateShipping(sub);

    const vat =
      Math.round(
        (sub + shipping) *
          Number(settings?.vat_rate ?? 0.15) *
          100
      ) / 100;

    const total =
      Math.round((sub + shipping + vat) * 100) / 100;

    box.innerHTML =
      cart
        .map((item) => {
          const product = productBySlug(item.id);
          const variant = variantById(item.variantId);

          const name =
            locale === 'ar'
              ? product?.name_ar || product?.name_en
              : product?.name_en || product?.slug;

          return `
            <div class="total-line">
              <span>
                ${esc(name)}
                ${
                  variant
                    ? ' — ' +
                      esc(
                        locale === 'ar'
                          ? variant.name_ar
                          : variant.name_en
                      )
                    : ''
                }
                × ${Number(item.qty)}
              </span>
              <b>${money(itemPrice(item) * item.qty)}</b>
            </div>
          `;
        })
        .join('') +
      `
        <hr>

        <div class="total-line">
          <span>${labels.subtotal}</span>
          <b>${money(sub)}</b>
        </div>

        <div class="total-line">
          <span>${labels.shipping}</span>
          <b>${money(shipping)}</b>
        </div>

        <div class="total-line">
          <span>${labels.vat}</span>
          <b>${money(vat)}</b>
        </div>

        <div class="total-line final">
          <span>${labels.total}</span>
          <b>${money(total)}</b>
        </div>
      `;
  }

  function renderOptions() {
    const payment =
      document.querySelector('[name=payment_method]');

    const shipping =
      document.querySelector('[name=shipping_method]');

    if (payment) {
      const types = new Set(
        cart.map((item) => productBySlug(item.id)?.type)
      );

      const methods =
        settings?.enabled_payment_methods || [
          'invoice',
          'bank_transfer'
        ];

      payment.innerHTML = methods
        .filter(
          (method) =>
            method !== 'cod' ||
            (settings?.cod_enabled &&
              types.size === 1 &&
              types.has('physical'))
        )
        .map(
          (method) => `
            <option value="${esc(method)}">
              ${esc(
                method === 'cod'
                  ? labels.cod
                  : method === 'bank_transfer'
                  ? labels.bank
                  : method === 'invoice'
                  ? labels.invoice
                  : labels.online
              )}
            </option>
          `
        )
        .join('');
    }

    if (shipping) {
      const hasPhysical = physicalItems().length > 0;
      const field = shipping.closest('.field');

      if (field) {
        field.hidden = !hasPhysical;
      }

      shipping.innerHTML =
        `<option value="shipping">${labels.shipping}</option>` +
        (settings?.pickup_enabled
          ? '<option value="pickup">Pickup</option>'
          : '');

      shipping.onchange = renderSummary;
    }
  }

  function getIdempotencyKey() {
    let key = sessionStorage.getItem(IDEMPOTENCY_KEY);

    if (!key) {
      key =
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`;

      sessionStorage.setItem(IDEMPOTENCY_KEY, key);
    }

    return key;
  }

  function clearIdempotencyKey() {
    sessionStorage.removeItem(IDEMPOTENCY_KEY);
  }

  function setSubmitting(form, submitting) {
    isSubmitting = submitting;

    const button = form?.querySelector(
      'button[type="submit"]'
    );

    if (!button) return;

    button.disabled = submitting;
    button.setAttribute(
      'aria-disabled',
      submitting ? 'true' : 'false'
    );

    if (!button.dataset.originalText) {
      button.dataset.originalText =
        button.textContent || 'CREATE ORDER →';
    }

    button.textContent = submitting
      ? labels.sending
      : button.dataset.originalText;
  }

  async function boot() {
    try {
      [products, settings] = await Promise.all([
        ASolutionRemote.listProducts(),
        ASolutionRemote.listSettings()
      ]);

      const ids = cart
        .map((item) => item.variantId)
        .filter(Boolean);

      if (ids.length) {
        const productIds = [
          ...new Set(
            cart
              .map(
                (item) =>
                  productBySlug(item.id)?.id
              )
              .filter(Boolean)
          )
        ];

        const groups = await Promise.all(
          productIds.map((id) =>
            ASolutionRemote.listVariants(id)
          )
        );

        variants = groups.flat();
      }

      renderOptions();
      renderSummary();
    } catch (error) {
      const status =
        document.querySelector('#checkout-status');

      if (status) {
        status.className = 'error';
        status.textContent =
          labels.offline +
          ' ' +
          (error?.message || '');
      }
    }
  }

  const checkoutForm =
    document.querySelector('#checkout-form');

  checkoutForm?.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();

      /*
       * IMPORTANT:
       * Do not use event.currentTarget after an await.
       * Browsers may clear currentTarget once the synchronous
       * event handler phase has completed.
       */
      const form = event.currentTarget;

      if (!form || isSubmitting) return;

      const status =
        document.querySelector('#checkout-status');

      if (!status) return;

      const data = Object.fromEntries(
        new FormData(form)
      );

      const validator =
        window.ASolutionCommerceDomain ||
        window.ASolutionStore;

      const validation =
        validator.validateCheckout(data);

      if (!validation.valid) {
        status.className = 'error';
        status.textContent = labels.invalid;
        return;
      }

      if (!cart.length) {
        status.className = 'error';
        status.textContent = labels.empty;
        return;
      }

      setSubmitting(form, true);

      status.className = '';
      status.textContent = labels.sending;

      const idempotencyKey =
        getIdempotencyKey();

      const params =
        new URLSearchParams(location.search);

      const payload = {
        customer: data,

        items: cart.map((item) => ({
          slug: item.id,
          quantity: Number(item.qty || 1),
          variant_id: item.variantId || null
        })),

        coupon_code:
          data.coupon_code || '',

        payment_method:
          data.payment_method || 'invoice',

        shipping_method:
          data.shipping_method || null,

        locale,

        idempotency_key: idempotencyKey,

        attribution: {
          source:
            params.get('utm_source') || '',
          medium:
            params.get('utm_medium') || '',
          campaign:
            params.get('utm_campaign') || ''
        }
      };

      try {
        const order =
          await ASolutionRemote.createOrder(payload);

        if (
          !['invoice', 'bank_transfer', 'cod'].includes(
            order.payment_method
          )
        ) {
          status.textContent =
            'Redirecting to secure payment…';

          const payment =
            await ASolutionRemote.createPayment(
              order.order_number,
              order.public_token,
              order.payment_method
            );

          location.href = payment.checkout_url;
          return;
        }

        /*
         * Order is confirmed at this point.
         * Only now clear cart/idempotency state.
         */
        localStorage.removeItem(CART_KEY);
        clearIdempotencyKey();

        cart = [];

        status.className = 'success';
        status.textContent =
          `${labels.success} ` +
          `${labels.ref}: ${order.order_number} — ` +
          `${money(order.total)}`;

        /*
         * Use the saved form reference rather than
         * event.currentTarget after the async request.
         */
        form.reset();

        renderSummary();
      } catch (error) {
        status.className = 'error';

        status.textContent =
          labels.offline +
          ' ' +
          (error?.message || '');

        /*
         * Keep the same idempotency key after a network/server
         * failure. A retry therefore cannot create a second order
         * if the first request actually reached the server.
         */
        setSubmitting(form, false);
      }
    }
  );

  boot();
})();
