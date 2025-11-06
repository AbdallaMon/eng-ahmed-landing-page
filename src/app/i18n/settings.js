export const fallbackLng = 'ar'
export const languages = [fallbackLng, 'en']
export const defaultNS = 'locales'
export const cookieName = 'i18next'

export function getOptions(lng = fallbackLng, ns = defaultNS) {
    return {
        supportedLngs: languages,
        fallbackLng,
        lng,
        fallbackNS: defaultNS,
        defaultNS,
        ns
    }
}