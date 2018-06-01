module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import",
        "chai-friendly"
    ],
    "globals": {
        "window": true,
        "document": true,
        "foo": true,
        "it": true,
        "chai": true,
        "describe": true,
        "beforeEach": true
    },
    "rules": {
        "no-unused-expressions": 0,
        "chai-friendly/no-unused-expressions": 2,
        "linebreak-style": 0
    }
};
