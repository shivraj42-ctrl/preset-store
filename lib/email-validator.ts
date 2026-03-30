/**
 * Disposable/temporary email domain blocklist.
 * Blocks known throwaway email services to ensure only real email providers are used.
 * This list covers the most popular disposable email services.
 */
const DISPOSABLE_DOMAINS: Set<string> = new Set([
  // Top disposable email services
  "tempmail.com", "temp-mail.org", "temp-mail.io",
  "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "guerrillamail.de",
  "guerrillamailblock.com", "grr.la", "sharklasers.com", "guerrilla.ml",
  "mailinator.com", "mailinator2.com", "mailinator.net",
  "yopmail.com", "yopmail.fr", "yopmail.net",
  "throwaway.email", "throwamail.com",
  "10minutemail.com", "10minute.email", "10minutemail.net",
  "maildrop.cc", "mailnesia.com", "mailsac.com",
  "dispostable.com", "disposableemailaddresses.emailmiser.com",
  "trashmail.com", "trashmail.me", "trashmail.net", "trashmail.org",
  "tempail.com", "tempr.email", "tempmailo.com",
  "fakeinbox.com", "fakemail.net",
  "mohmal.com", "mohmal.in", "mohmal.tech",
  "getnada.com", "nada.email", "nada.ltd",
  "mailcatch.com", "mailexpire.com",
  "discard.email", "discardmail.com", "discardmail.de",
  "emailondeck.com", "instantemailaddress.com",
  "harakirimail.com", "spamgourmet.com",
  "mytemp.email", "mytrashmail.com",
  "sharklasers.com", "spam4.me", "spamfree24.org",
  "mailnull.com", "mailscrap.com",
  "mintemail.com", "mt2015.com",
  "thankyou2010.com", "trash-mail.at",
  "bugmenot.com", "binkmail.com",
  "bobmail.info", "chammy.info",
  "devnullmail.com", "dingbone.com",
  "dodgit.com", "dodgeit.com",
  "e4ward.com", "emailigo.de",
  "emailwarden.com", "enterto.com",
  "ephemail.net", "filzmail.com",
  "getairmail.com", "getonemail.com",
  "getonemail.net", "girlsundertheinfluence.com",
  "gishpuppy.com", "great-host.in",
  "greensloth.com", "haltospam.com",
  "jetable.org", "kasmail.com",
  "koszmail.pl", "kurzepost.de",
  "letthemeatspam.com", "lhsdv.com",
  "lookugly.com", "lortemail.dk",
  "lr78.com", "mailbidon.com",
  "mailblocks.com", "mailmoat.com",
  "mailshell.com", "mailzilla.com",
  "nomail.xl.cx", "nobulk.com",
  "noclickemail.com", "nogmailspam.info",
  "nomail2me.com", "nospam.ze.tc",
  "nospamfor.us", "nowmymail.com",
  "obobbo.com", "onewaymail.com",
  "owlpic.com", "pjjkp.com",
  "pookmail.com", "proxymail.eu",
  "putthisinyouremail.com", "reallymymail.com",
  "receiveee.com", "regbypass.com",
  "safetymail.info", "skeefmail.com",
  "slipry.net", "slaskpost.se",
  "sogetthis.com", "soodonims.com",
  "spambob.com", "spambob.net",
  "spambog.com", "spambox.us",
  "spamcero.com", "spamday.com",
  "spamex.com", "spamfree.eu",
  "spamhole.com", "spaml.com",
  "spammotel.com", "spamobox.com",
  "spamspot.com", "tempemail.co.za",
  "tempemail.net", "tempinbox.com",
  "tempmail.eu", "tempmail.it",
  "tempomail.fr", "temporarily.de",
  "temporarioemail.com.br", "temporaryemail.net",
  "temporaryforwarding.com", "temporaryinbox.com",
  "temporarymailaddress.com", "thankdog.com",
  "thisisnotmyrealemail.com", "throwawayemailaddress.com",
  "tittbit.in", "trashemail.de",
  "trashymail.com", "trashymail.net",
  "turual.com", "twinmail.de",
  "uggsrock.com", "upliftnow.com",
  "venompen.com", "veryreallywow.com",
  "wh4f.org", "whyspam.me",
  "willhackforfood.biz", "willselfdestruct.com",
  "wuzupmail.net", "xagloo.com",
  "yep.it", "yogamaven.com",
  "zehnminutenmail.de", "zippymail.info",
  "zoaxe.com", "zoemail.org",
  // Additional commonly used ones
  "mailnator.com", "tempinbox.co.uk",
  "crazymailing.com", "tmail.ws",
  "mail-temporaire.fr", "tmpmail.net", "tmpmail.org",
  "emailfake.com", "generator.email", "inboxkitten.com",
  "burnermail.io", "guerrillamail.info",
]);

/**
 * Allowed email domains — only major, trusted email providers.
 * If you prefer an allowlist approach, use this instead of the blocklist.
 */
const ALLOWED_DOMAINS: Set<string> = new Set([
  // Google
  "gmail.com", "googlemail.com",
  // Microsoft
  "outlook.com", "hotmail.com", "live.com", "msn.com",
  "outlook.in", "hotmail.co.uk", "hotmail.in", "live.in",
  // Yahoo
  "yahoo.com", "yahoo.co.in", "yahoo.in", "yahoo.co.uk",
  "ymail.com", "rocketmail.com",
  // Apple
  "icloud.com", "me.com", "mac.com",
  // Other trusted providers
  "protonmail.com", "proton.me", "pm.me",
  "zoho.com", "zohomail.in",
  "aol.com",
  "mail.com",
  "gmx.com", "gmx.net",
  "fastmail.com", "fastmail.fm",
  "tutanota.com", "tuta.io",
  "rediffmail.com",
  // Indian ISPs
  "sify.com", "vsnl.net",
]);

/**
 * Validates that an email domain is from a trusted/real provider.
 * Uses an allowlist approach — only well-known providers are accepted.
 * Returns { valid: boolean, reason?: string }
 */
export function validateEmailDomain(email: string): { valid: boolean; reason?: string } {
  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain) {
    return { valid: false, reason: "Invalid email address." };
  }

  // Block known disposable domains explicitly
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason: "Temporary or disposable emails are not allowed. Please use a real email address (Gmail, Outlook, Yahoo, etc).",
    };
  }

  // Check against allowlist
  if (!ALLOWED_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason: "Please use a major email provider (Gmail, Outlook, Yahoo, iCloud, ProtonMail, etc).",
    };
  }

  return { valid: true };
}
