export const serviceIds = ['shop', 'business-card', 'landing', 'multi-page', 'unsure'];
export const approachIds = ['template', 'custom', 'unsure'];
export const consentVersion = 'estimate-v1-2026-11-06';

export function validateInquiry(input) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const value = {
    name: typeof source.name === 'string' ? source.name.trim() : '',
    contact: typeof source.contact === 'string' ? source.contact.trim() : '',
    description: typeof source.description === 'string' ? source.description.trim() : '',
    service: typeof source.service === 'string' ? source.service : 'unsure',
    approach: typeof source.approach === 'string' ? source.approach : 'unsure',
    locale: source.locale === 'en' ? 'en' : 'ru',
    consent: source.consent === true,
  };
  const errors = {};
  if (value.name.length < 2 || value.name.length > 80) errors.name = 'name';
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.contact);
  const digits = value.contact.replace(/\D/g, '');
  const phone = /^[+\d\s().-]+$/.test(value.contact) && digits.length >= 7 && digits.length <= 15;
  if (value.contact.length > 120 || (!email && !phone)) errors.contact = 'contact';
  if (value.description.length < 10 || value.description.length > 3000) errors.description = 'description';
  if (!serviceIds.includes(value.service)) errors.service = 'service';
  if (!approachIds.includes(value.approach)) errors.approach = 'approach';
  if (!value.consent) errors.consent = 'consent';
  if (typeof source.website === 'string' && source.website.trim()) errors.website = 'spam';
  return { valid: Object.keys(errors).length === 0, errors, value };
}
