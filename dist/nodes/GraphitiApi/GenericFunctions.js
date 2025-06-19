"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEpisode = addEpisode;
exports.searchEpisodes = searchEpisodes;
async function addEpisode(context, params) {
    const credentials = await context.getCredentials('graphitiApi');
    return context.helpers.httpRequest({
        method: 'POST',
        url: `${credentials.baseUrl}/episodes/`,
        body: {
            name: params.name,
            content: params.content,
            type: params.type,
            description: params.description,
            reference_time: params.referenceTime || undefined,
        },
        json: true,
    });
}
async function searchEpisodes(context, params) {
    const credentials = await context.getCredentials('graphitiApi');
    return context.helpers.httpRequest({
        method: 'POST',
        url: `${credentials.baseUrl}/search/`,
        body: {
            query: params.query,
            search_type: params.searchType,
            center_node_uuid: params.centerNodeUuid || undefined,
            limit: params.searchType === 'node' ? params.limit : undefined,
        },
        json: true,
    });
}
//# sourceMappingURL=GenericFunctions.js.map