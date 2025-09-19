// import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";

declare global {
    interface Window {
        clarity?: (event: string, data?: any) => void;
    }
}

export default () => {
    CookieConsent.run({
        guiOptions: {
            consentModal: {
                layout: 'cloud',
                position: 'bottom right',
                equalWeightButtons: true,
                flipButtons: false,
            }
        },
        onConsent: () => {
            if (window.clarity) {
                window.clarity('consentv2', {
                    ad_Storage: "granted",
                    analytics_Storage: "granted"
                });
            }
        },
        categories: {
            analytics: {
                enabled: true,
                services: {
                    ga: {
                        label: 'Google Analytics',
                        cookies: [
                            {
                                name: /^(_ga.*|)/
                            }
                        ]
                    },
                    clarity: {
                        label: 'Microsoft Clarity',
                        cookies: [
                            {
                                name: /^(CLID|_clck|_clsk|SM|MUID|MR|SRM_B|ANONCHK)/
                            }
                        ]
                    },
                }
            },
            necessary: {
                enabled: true,
                readOnly: true,
                services: {
                    cc: {
                        label: "CookieConsent",
                        cookies: [
                            {
                                name: /^(cc_cookie)/
                            }
                        ]
                    },
                    yt: {
                        label: "YouTube embed",
                        cookies: [
                            {
                                name: /^(YSC|__Secure-ROLLOUT_TOKEN|VISITOR_INFO1_LIVE|__Secure-YEC|lastExternalReferrer|lastExternalReferrerTime|topicsLastReferenceTime|yt.innertube::nextId|yt-remote-connected-devices|ytidb::LAST_RESULT_ENTRY_KEY|yt.innertube::requests|yt-remote-device-id|_cltk|yt-remote-session-name|yt-remote-fast-check-period|iU5q-!O9@\$|yt-remote-session-app|-779a2343-56f2179e|yt-remote-cast-available|yt-remote-cast-installed)/
                            }
                        ]
                    },
                    flodesk: {
                        label: "Flodesk",
                        cookies: [
                            {
                                name: /^(__cf_bm)/
                            }
                        ]
                    },
                    maps: {
                        label: "Google Maps",
                        cookies: [
                            {
                                name: /^(SIDCC|NID|SID|SAPISID|APISID|CONSENT|1P_JAR|G_AUTHUSER_H)/
                            }
                        ]
                    }
                }
            },
            tracking: {
                enabled: true,
                services: {
                    fb: {
                        label: 'Facebook',
                        cookies: [
                            {
                                name: /^(_fbp)/
                            }
                        ]
                    },
                    li: {
                        label: 'LinkedIn',
                        cookies: [
                            {
                                name: /^(bcookie|li_gc|lidc|fd-form.*)/
                            }
                        ]
                    }
                }
            }
        },
        language: {
            default: 'en',
            translations: {
                en: {
                    consentModal: {
                        title: 'We use cookies',
                        description: 'We try our best to minimize how many cookies are set, but there are a few needed and we want you to have control over your experience with them.',
                        acceptAllBtn: 'Accept all',
                        acceptNecessaryBtn: 'Reject all',
                        showPreferencesBtn: 'Manage Individual preferences'
                    },
                    preferencesModal: {
                        title: 'Manage cookie preferences',
                        acceptAllBtn: 'Accept all',
                        acceptNecessaryBtn: 'Reject all',
                        savePreferencesBtn: 'Accept current selection',
                        closeIconLabel: 'Close modal',
                        sections: [
                            {
                                title: 'Strictly Necessary cookies',
                                description: 'These cookies are essential for the proper functioning of the website and cannot be disabled.',
                                linkedCategory: 'necessary'
                            },
                            {
                                title: 'Analytics',
                                description: 'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
                                linkedCategory: 'analytics'
                            },
                            {
                                title: 'Advert Performance Improvement',
                                description: 'These cookies collect information about how you use our website for the usage of improving our adverts on other platforms (there are no adverts on DevConf.co.za). All of the data is anonymized and cannot be used to identify you.',
                                linkedCategory: 'tracking'
                            },
                            {
                                title: 'More information',
                                description: 'For any queries in relation to my policy on cookies and your choices, please <a href="mailto:info@devconf.co.za">contact us</a>'
                            }
                        ]
                    }
                }
            }
        }
    });
}