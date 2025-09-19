import feedback from "./feedback"
import event from "./event"
import sponsorBlock from "./sponsorBlock"
import speakerFeedback from "./speakerFeedback"
import cookieConsent from './cookieConsent';

if (typeof fetch === 'undefined') {
    // eslint-disable-next-line no-alert
    alert("Oh no 😢 We don't support your web browser. Please upgrade to a newer version!")
}

event()
feedback()
sponsorBlock()
speakerFeedback()
cookieConsent();