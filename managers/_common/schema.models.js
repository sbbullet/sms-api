const emojis = require("../../public/emojis.data.json");
const { ACCESS_LEVEL_REGEX, EMAIL_REGEX, URL_REGEX, MONGO_OBJECT_ID_REGEX } = require("../../libs/constants");

module.exports = {
    id: {
        path: "id",
        label: "ID",
        type: "String",
        length: { min: 1, max: 50 },
        onError: {
            length: "$label must be between 1 and 50 characters long",
        },
    },
    mongoObjectId: {
        path: "id",
        label: "ID",
        type: "String",
        length: 24,
        regex: MONGO_OBJECT_ID_REGEX,
        onError: {
            length: "$label must be 24 characters long",
            regex: "$label must be a valid MongoDB Object ID",
        },
    },
    name: {
        path: "name",
        label: "Name",
        type: "String",
        length: { min: 3, max: 100 },
        custom: "name",
        customError: "$label must be at least 3 characters long",
        onError: {
            length: "$label must be between 3 and 100 characters long",
        },
    },
    username: {
        path: "username",
        label: "Username",
        type: "String",
        length: { min: 3, max: 20 },
        custom: "username",
        customError: "$label must be at least 3 characters long",
        onError: {
            length: "$label must be between 3 and 20 characters long",
        },
    },
    email: {
        path: "email",
        label: "Email",
        type: "String",
        length: { min: 3, max: 100 },
        regex: EMAIL_REGEX,
        onError: {
            regex: "$label must be a valid email address",
        },
    },
    password: {
        path: "password",
        label: "Password",
        type: "String",
        length: { min: 8, max: 100 },
        custom: "password",
        customError: "$label must be at least 8 characters long",
        onError: {
            length: "$label must be between 8 and 100 characters long",
        },
    },
    accessLevel: {
        path: "accessLevel",
        label: "Access Level",
        type: "String",
        regex: ACCESS_LEVEL_REGEX,
        onError: {
            regex: "$label must be a either 'superAdmin', 'user' or start with 'school:' and have school ID(s)",
        },
    },
    address: {
        path: "address",
        label: "Address",
        type: "Object",
        onError: {
            type: "Invalid type. $label must be an object with addressLine1, addressLine2(optional), city, state(name,iso2) and country(name,iso2)",
        },
    },
    addressLine1: {
        path: "addressLine1",
        label: "Address Line 1",
        type: "String",
        length: { min: 3, max: 100 },
    },
    addressLine2: {
        path: "addressLine2",
        label: "Address Line 2",
        type: "String",
        length: { min: 3, max: 100 },
    },
    city: {
        path: "city",
        label: "City",
        type: "String",
        length: { min: 3, max: 100 },
    },
    state: {
        path: "state",
        label: "State",
        type: "Object",
    },
    iso2: {
        path: "iso2",
        label: "ISO2 Code",
        type: "String",
        length: 2,
    },
    country: {
        path: "country",
        label: "Country",
        type: "Object",
    },
    zipcode: {
        path: "zipcode",
        label: "Zip/Postal Code",
        type: "String",
        length: { min: 3, max: 20 },
    },
    page: {
        path: "page",
        label: "Page Number",
        type: "String",
        canParse: "int",
        custom: "page",
        onError: {
            custom: "$label must be a numeric value",
        },
    },
    pageSize: {
        path: "pageSize",
        label: "Page Size",
        type: "String",
        canParse: "int",
        custom: "pageSize",
        onError: {
            custom: "$label must be a numeric value",
        },
    },
    title: {
        path: "title",
        label: "Title",
        type: "String",
        length: { min: 3, max: 300 },
    },
    label: {
        path: "label",
        label: "Label",
        type: "String",
        length: { min: 3, max: 100 },
    },
    shortDesc: {
        path: "desc",
        label: "Short Description",
        type: "String",
        length: { min: 3, max: 300 },
    },
    longDesc: {
        path: "desc",
        label: "Long Description",
        type: "String",
        length: { min: 3, max: 2000 },
    },
    url: {
        path: "url",
        label: "URL",
        type: "String",
        regex: URL_REGEX,
        length: { min: 9, max: 300 },
        onError: {
            regex: "$label must be a valid URL",
            length: "$label must be between 9 and 300 characters long",
        },
    },
    grade: {
        path: "grade",
        label: "Grade",
        type: "Number",
        length: { min: 1, max: 20 },
    },
    capacity: {
        path: "capacity",
        label: "Capacity",
        type: "Number",
        length: { min: 1, max: 1000 },
    },
    emoji: {
        path: "emoji",
        label: "Emoji",
        type: "Array",
        items: {
            type: "String",
            length: { min: 1, max: 10 },
            oneOf: emojis.value,
        },
    },
    price: {
        path: "price",
        label: "Price",
        path: "price",
        type: "Number",
    },
    avatar: {
        path: "avatar",
        label: "Avatar",
        path: "avatar",
        type: "String",
        length: { min: 8, max: 100 },
    },
    text: {
        label: "Text",
        type: "String",
        length: { min: 3, max: 15 },
    },
    longText: {
        type: "String",
        length: { min: 3, max: 250 },
    },
    paragraph: {
        type: "String",
        label: "Paragraph",
        length: { min: 3, max: 10000 },
    },
    phone: {
        type: "String",
        label: "Phone",
        path: "phone",
        length: 13,
    },
    // email: {
    //     type: "String",
    //     label: "Email",
    //     regex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    // },
    number: {
        type: "Number",
        length: { min: 1, max: 6 },
    },
    arrayOfstrings: {
        type: "Array",
        items: {
            type: "String",
            length: { min: 3, max: 100 },
        },
    },
    obj: {
        type: "Object",
    },
    bool: {
        type: "Boolean",
    },
};
