const HTTPStatusCode = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    SERVICE_UNAVAILABLE: 503,
};

// prettier-ignore
const COUNTRY_ISO_CODES = Object.freeze(["AF","AX","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","KH","CM","CA","CV","KY","CF","TD","CL","CN","CX","CC","CO","KM","CG","CK","CR","CI","HR","CU","CW","CY","CZ","CD","DK","DJ","DM","DO","TL","EC","EG","SV","GQ","ER","EE","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IL","IT","JM","JP","JE","JO","KZ","KE","KI","XK","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MK","MG","MW","MY","MV","ML","MT","IM","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","KP","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","RE","RO","RU","RW","SH","KN","LC","PM","VC","BL","MF","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","KR","SS","ES","LK","SD","SR","SJ","SZ","SE","CH","SY","TW","TJ","TZ","TH","BS","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","US","UM","UY","UZ","VU","VA","VE","VN","VG","VI","WF","EH","YE","ZM","ZW"]);

Object.freeze(HTTPStatusCode);

const BCRYPT_SALT_ROUNDS = 10;
const URL_REGEX = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-z]{2,}(\.[a-z]{2,})?(\/[^s]*)?$/;
const EMAIL_REGEX = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
const MONGO_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const SUPER_ADMIN_ACESS_LEVEL = "superAdmin";
const SCHOOL_ADMIN_ACCESS_LEVEL_PREFIX = "school:";
const USER_ACCESS_LEVEL = "user";
const ACCESS_LEVEL_REGEX = /^(superAdmin|user|school:([0-9a-fA-F]{24})(?:,([0-9a-fA-F]{24}))*)$/;

module.exports = {
    HTTPStatusCode,
    COUNTRY_ISO_CODES,
    BCRYPT_SALT_ROUNDS,
    URL_REGEX,
    EMAIL_REGEX,
    ACCESS_LEVEL_REGEX,
    MONGO_OBJECT_ID_REGEX,
    SUPER_ADMIN_ACESS_LEVEL,
    SCHOOL_ADMIN_ACCESS_LEVEL_PREFIX,
    USER_ACCESS_LEVEL,
};
