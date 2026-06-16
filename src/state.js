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
    // You could trigger a custom event here if you wanted to be fancy
}

export function getAppState() {
    return currState;
}