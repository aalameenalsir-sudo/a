A Solution — Google SEO Configuration

Current SEO setup:

- robots.txt allows search engines to crawl the public website.
- The /admin/ page is protected from search indexing using:
  noindex, nofollow, noarchive
- sitemap.xml contains the canonical English and Arabic public URLs.
- hreflang is configured for:
  English
  Arabic
  x-default

Public URLs:
- https://alameensolution.site/
- https://alameensolution.site/ar/
- https://alameensolution.site/sitemap.xml

Admin:
- https://alameensolution.site/admin/
- Admin access is protected by Supabase authentication and database security policies.
- The admin page should not appear in search engine results.

Google Search Console:
- Domain verification completed.
- Sitemap submitted successfully.
- English page indexing requested.
- Arabic page is configured and ready for indexing.

SEO structure:
- English canonical: https://alameensolution.site/
- Arabic canonical: https://alameensolution.site/ar/
- Sitemap: https://alameensolution.site/sitemap.xml

Do not block /admin/ in robots.txt.
Search engines must be able to crawl the admin page in order to read the noindex directive.
