# A Solution — إعداد الأمين تاج السر

هذه الحزمة تستبدل فيديو MP4 بمساعد حي عبر HeyGen LiveAvatar. الصفحة العامة لا تحتوي على مفتاح HeyGen؛ المفتاح يبقى داخل Supabase Edge Function.

## 1. ارفع ملفات الموقع

ارفع الملفات الموجودة في الحزمة إلى جذر مستودع GitHub `aalameenalsir-sudo/a` مع الحفاظ على المسارات:

- `alameen-liveavatar-core.js`
- `alameen-liveavatar.js`
- `alameen-welcome.js`
- `alameen-welcome.css`
- `alameen-taj-alsir-idle.jpg`
- `alameen-taj-alsir-standing.png`
- `a-solution-logo-tight.png`
- `ar/DigitalHumans/index.html`
- `ar/Welcome/index.html`
- `404.html`
- `supabase/config.toml`
- `supabase/functions/alameen-liveavatar-token/index.ts`
- `supabase/functions/alameen-liveavatar-token/token-core.mjs`
- `supabase/functions/alameen-liveavatar-token/README.md`
- `A_SOLUTION_LIVEAVATAR_SETUP.md`

الملفات السابقة للواجهة تبقى كما هي. لا ترفع أي ملف يحتوي على `HEYGEN_API_KEY`.

## 2. جهّز الـ Avatar في HeyGen

أنشئ Custom Interactive Avatar باستخدام صورة/فيديو الأمين وبموافقته، ثم انسخ:

- `Avatar ID`
- `Context ID` إذا ظهر في إعداد الشخصية
- مفتاح API الخاص بحساب HeyGen

الوضع المستخدم هو `FULL + CONVERSATIONAL` حتى يتولى LiveAvatar الصوت وحركة الفم والتعبير والحركة اللحظية. الصفحة ترسل الترحيب مرة واحدة بعد أول ضغطة على «ابدأ التحدث» — لأن المتصفح يمنع الصوت التلقائي قبل تفاعل المستخدم — ثم يبقى الأمين هادئاً إلى أن يرسل الزائر رسالة أو يبدأ التحدث.

## 3. خزّن الأسرار في Supabase

من مجلد المشروع الذي يحتوي على `supabase/functions` شغّل:

```bash
supabase secrets set \
  HEYGEN_API_KEY="ضع-مفتاح-HeyGen-هنا" \
  LIVEAVATAR_AVATAR_ID="ضع-Avatar-ID-هنا" \
  LIVEAVATAR_CONTEXT_ID="ضع-Context-ID-هنا" \
  LIVEAVATAR_LANGUAGE="ar-SA" \
  LIVEAVATAR_SANDBOX="true" \
  ALAMEEN_ALLOWED_ORIGIN="https://alameensolution.site"
```

إذا لم يكن لديك `Context ID`، احذف سطره. ابدأ بـ `LIVEAVATAR_SANDBOX="true"` للاختبار، وبعد نجاح الجلسة حوّله إلى `false` للإنتاج.

## 4. انشر الدالة

```bash
supabase functions deploy alameen-liveavatar-token
```

ضمّن ملف `supabase/config.toml` عند النشر؛ فهو يجعل الدالة تتحقق من
`sb_publishable` داخل الكود بدلاً من محاولة تفسيره كـ JWT.

الدالة المنشورة المتوقعة:

```text
https://bgxtcpcbkjftkgswpizr.supabase.co/functions/v1/alameen-liveavatar-token
```

لا تغيّر مفتاح Supabase الموجود داخل صفحات الموقع؛ هذا `publishable key` عام للمتصفح، وليس مفتاح HeyGen. الدالة تتحقق من المفتاح في ترويسة `apikey` ومن Origin، ثم تعيد `session_token` قصير العمر فقط.
الدالة تضع أيضاً حداً احتياطياً قدره ست جلسات في الدقيقة لكل عميل على مستوى edge لتقليل التكرار غير المقصود.

## 5. اختبار سريع

افتح:

```text
https://alameensolution.site/ar/DigitalHumans/
```

المتوقع:

1. تظهر صورة الأمين بهدوء.
2. يظهر ترحيب صوتي مرة واحدة عند بدء الجلسة.
3. تتحول الصورة إلى بث LiveAvatar أثناء الكلام مع حركة الفم والرأس والعينين.
4. بعد انتهاء الجملة يعود إلى الوضع الهادئ.
5. عند فشل الخدمة لا تتعطل الصفحة؛ تظهر صورة ثابتة وواجهة الكتابة.

إذا ظهرت الصورة الثابتة فقط، افحص أولاً قيمة `HEYGEN_API_KEY` و`LIVEAVATAR_AVATAR_ID` و`LIVEAVATAR_SANDBOX` في Supabase ثم أعد نشر الدالة.
