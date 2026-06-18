// state.js
export const APP_STATES = {
    SEARCH: 'SEARCH',
    PLAYGROUND: 'PLAYGROUND',
    ADD: 'ADD',
    DECRYPT_MODE: 'DECRYPT_MODE' // When an item is selected
};

let currState = APP_STATES.SEARCH;

export function setState(newState) {
    currState = newState;
    console.log("State changed to:", currState);
}

export function getAppState() {
    return currState;
}
