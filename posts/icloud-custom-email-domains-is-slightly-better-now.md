---
title: iCloud+ Custom Email Domains is slightly better now
slug: icloud-custom-email-domains-is-slightly-better-now
date: 2022-09-18T19:00:00.000Z
comments: false
category: "Cloud Architecture"
---

👍 **Update Oct 2022:** Having spent some more time with iCloud Mail, I have decided to switch my domains over to using it. To get around the issue mentioned below I'm using a custom SMTP server for just the alias I cannot create.

My Fastmail subscription is up for renewal so I thought I would take another look at iCloud+ Custom Email Domains and see if it would be viable to switch seeing as I already subscribe to iCloud+ for photo storage.

[Dominic Lautner detailed a number of shortfalls in Feb 2022](https://domlaut.com/icloud-custom-email-domains-should-be-better/) and unfortunately not enough has changed to entice me to switch. Here is an update:

### Issue #1: No catch-all address support

✅ Fixed - As of September’s iOS 16 launch (was available in [June](https://www.reddit.com/r/apple/comments/ve9njl/for_those_using_a_custom_icloud_domain_you_can/) as a beta feature) iCloud+ now offers catch-all support for domains

### Issue #2: Aggressive DNS record validation, Issue #3: No inbound email relay support, Issue #4: Opaque error messages

👎 These matters have not changed. iCloud will still prevent you from creating new aliases if you modify the provided MX records and present you with a generic non-helpful error message.

### Issue #5: Coupling with Apple IDs, Issue #6: Emails sent from addresses without an account get dropped

✋ This is what is stopping me from migrating right now. My primary email address is firstname@domain.com and unfortunately at some point I created this as an Apple ID (account is unused). This prevents me from creating the same address as an alias under the domain. Apparently if you kill the Apple ID account it takes 1 year to become available as an alias (I have not tested this).

But what about the catch-all? Well yes, this does mitigate the problem for incoming email, despite there being an Apple ID for firstname@domain.com with catch-all enabled I can receive email to this address. However I’m unable to send email from this address using iCloud due Issue #6.


<script src="https://giscus.app/client.js"
        data-repo="jkpe/highlyavailable.net-comments"
        data-repo-id="R_kgDOILL-iA"
        data-category="Announcements"
        data-category-id="DIC_kwDOILL-iM4CR455"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="en"
        crossorigin="anonymous"
        async>
</script>
