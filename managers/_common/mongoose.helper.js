async function paginate(model, { page = 1, pageSize = 25, filters = {}, sortBy = { createdAt: -1 }, select = {} }) {
    page = Math.max(1, page || 1);
    pageSize = Math.max(1, pageSize || 25);

    const skip = (page - 1) * pageSize;

    const [data, totalItems] = await Promise.all([
        model.find(filters).select(select).sort(sortBy).skip(skip).limit(pageSize).lean(),
        model.countDocuments(filters),
    ]);

    return {
        items: data,
        currentPage: page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        hasMore: page * pageSize < totalItems,
    };
}

function flattenNestedObjectForUpdate(updateObject, prefix = "") {
    const query = {};
    for (const key in updateObject) {
        if (updateObject[key] && typeof updateObject[key] === "object" && !Array.isArray(updateObject[key])) {
            // Recursively handle nested objects
            Object.assign(query, flattenNestedObjectForUpdate(updateObject[key], `${prefix}${key}.`));
        } else {
            // Add the current key to the query
            query[`${prefix}${key}`] = updateObject[key];
        }
    }
    return query;
}

module.exports = {
    paginate,
    flattenNestedObjectForUpdate,
};
