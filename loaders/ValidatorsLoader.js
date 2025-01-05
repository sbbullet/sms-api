const { HTTPStatusCode } = require("../libs/constants");
const loader = require("./_common/fileLoader");
const Pine = require("qantra-pineapple");

/**
 * load any file that match the pattern of function file and require them
 * @return an array of the required functions
 */
module.exports = class ValidatorsLoader {
    constructor({ models, customValidators } = {}) {
        this.models = models;
        this.customValidators = customValidators;
    }
    load() {
        const validators = {};

        /**
         * load schemas
         * load models ( passed to the consturctor )
         * load custom validators
         */
        const schemas = loader("./managers/**/*.schema.js");

        Object.keys(schemas).forEach((sk) => {
            let pine = new Pine({ models: this.models, customValidators: this.customValidators });
            validators[sk] = {};
            Object.keys(schemas[sk]).forEach((s) => {
                validators[sk][s] = async (data) => {
                    const result = await pine.validate(data, schemas[sk][s]);
                    return result
                        ? { errors: result, error: "Invalid data", code: HTTPStatusCode.UNPROCESSABLE_ENTITY }
                        : result;
                };
                /** also exports the trimmer function for the same */
                validators[sk][`${s}Trimmer`] = async (data) => {
                    return await pine.trim(data, schemas[sk][s]);
                };
            });
        });

        return validators;
    }
};
