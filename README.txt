A Solution — Google SEO Fix

Replace these two files at the ROOT of the GitHub repository:
- robots.txt
- sitemap.xml

robots.txt allows Google to crawl the public website and blocks /admin/ crawling.
sitemap.xml contains the canonical English and Arabic public URLs with hreflang alternates.

After GitHub Pages deploys, re-test in Google Search Console:
1) URL Inspection: https://alameensolution.site/
2) URL Inspection: https://alameensolution.site/ar/
3) Re-submit https://alameensolution.site/sitemap.xml if needed.
