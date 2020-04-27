
import Lang from "lang.js"

// Define all paths to translations
const paths = [{
    messages: require("../lang/shortcuts/player.en").default,
    namespace: 'en.player'
}]

// Merge all into 1 object
const mergedMessages = paths.map(lang => {
    let keys = {
        [lang.namespace]: lang.messages
    }
    return keys
})

// Export Lang instance
const lang = new Lang({
    locale: 'en',
    messages: Object.assign({}, ...mergedMessages)
})

export default lang