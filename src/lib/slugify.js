import makeSlug from 'slugify';

export const slugify = (string) => {
    return makeSlug(string, {
        replacement: '-',
        remove: /[\[\],?*+~.()'"!:@]/g,
        strict: true,
        lower: true,
    });
};

export default slugify;