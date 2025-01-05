const { COUNTRY_ISO_CODES } = require("../../../libs/constants");
const { label } = require("../../_common/schema.models");

module.exports = {
    createSchool: [
        {
            model: "name",
            required: true,
        },
        {
            model: "phone",
            required: true,
        },
        {
            model: "address",
            required: true,
        },
        {
            model: "addressLine1",
            path: "address.addressLine1",
            required: true,
        },
        {
            model: "addressLine2",
            path: "address.addressLine2",
            required: false, // This field is optional
        },
        {
            model: "city",
            path: "address.city",
            required: true,
        },
        {
            model: "state",
            path: "address.state",
            required: true,
        },
        {
            model: "name",
            path: "address.state.name",
            label: "State Name",
            required: true,
        },
        {
            model: "iso2",
            path: "address.state.iso2",
            label: "State ISO2 Code",
            length: { min: 2, max: 10 },
            required: true,
            onError: {
                length: "Invalid $label. Must be between 2 and 10 characters",
            },
        },
        {
            model: "zipcode",
            path: "address.zipcode",
            required: true,
        },
        {
            model: "country",
            path: "address.country",
            required: true,
        },
        {
            model: "name",
            path: "address.country.name",
            label: "Country Name",
            required: true,
        },
        {
            model: "iso2",
            path: "address.country.iso2",
            label: "Country ISO2 Code",
            oneOf: COUNTRY_ISO_CODES,
            length: 2,
            required: true,
            onError: {
                oneOf: "Invalid $label. Must be one of: " + COUNTRY_ISO_CODES.join(", "),
            },
        },
        {
            model: "url",
            path: "website",
            label: "Website",
            required: true,
        },
    ],

    updateSchool: [
        {
            model: "name",
            required: false,
        },
        {
            model: "phone",
            required: false,
        },
        {
            model: "address",
            required: false,
        },
        {
            model: "addressLine1",
            path: "address.addressLine1",
            required: false,
        },
        {
            model: "addressLine2",
            path: "address.addressLine2",
            required: false,
        },
        {
            model: "city",
            path: "address.city",
            required: false,
        },
        {
            model: "state",
            path: "address.state",
            required: false,
        },
        {
            model: "name",
            path: "address.state.name",
            label: "State Name",
            required: false,
        },
        {
            model: "iso2",
            path: "address.state.iso2",
            label: "State ISO2 Code",
            length: { min: 2, max: 10 },
            required: false,
            onError: {
                length: "Invalid $label. Must be between 2 and 10 characters",
            },
        },
        {
            model: "zipcode",
            path: "address.zipcode",
            required: false,
        },
        {
            model: "country",
            path: "address.country",
            required: false,
        },
        {
            model: "name",
            path: "address.country.name",
            label: "Country Name",
            required: false,
        },
        {
            model: "iso2",
            path: "address.country.iso2",
            label: "Country ISO2 Code",
            oneOf: COUNTRY_ISO_CODES,
            length: 2,
            required: false,
            onError: {
                oneOf: "Invalid $label. Must be one of: " + COUNTRY_ISO_CODES.join(", "),
            },
        },
        {
            model: "url",
            path: "website",
            label: "Website",
            required: false,
        },
    ],

    pathParams: [
        {
            model: "mongoObjectId",
            path: "schoolId",
            label: "Path Param: School ID",
            required: true,
        },
    ],
};
