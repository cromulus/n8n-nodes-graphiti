"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEpisode = addEpisode;
exports.searchEpisodes = searchEpisodes;
exports.addMessages = addMessages;
exports.getMemory = getMemory;
exports.getEpisodes = getEpisodes;
exports.addEntityNode = addEntityNode;
exports.getEntityEdge = getEntityEdge;
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
async function addMessages(context, params) {
    const credentials = await context.getCredentials('graphitiApi');
    return context.helpers.httpRequest({
        method: 'POST',
        url: `${credentials.baseUrl}/messages`,
        body: {
            group_id: params.group_id,
            messages: params.messages,
        },
        json: true,
    });
}
async function getMemory(context, params) {
    const credentials = await context.getCredentials('graphitiApi');
    return context.helpers.httpRequest({
        method: 'POST',
        url: `${credentials.baseUrl}/get-memory`,
        body: {
            group_id: params.group_id,
            max_facts: params.max_facts || 10,
            center_node_uuid: params.center_node_uuid || null,
            messages: params.messages,
        },
        json: true,
    });
}
async function getEpisodes(context, params) {
    const credentials = await context.getCredentials('graphitiApi');
    return context.helpers.httpRequest({
        method: 'GET',
        url: `${credentials.baseUrl}/episodes/${params.group_id}?last_n=${params.last_n}`,
        json: true,
    });
}
async function addEntityNode(context, params) {
    const credentials = await context.getCredentials('graphitiApi');
    return context.helpers.httpRequest({
        method: 'POST',
        url: `${credentials.baseUrl}/entity-node`,
        body: {
            uuid: params.uuid,
            group_id: params.group_id,
            name: params.name,
            summary: params.summary || '',
        },
        json: true,
    });
}
async function getEntityEdge(context, params) {
    const credentials = await context.getCredentials('graphitiApi');
    return context.helpers.httpRequest({
        method: 'GET',
        url: `${credentials.baseUrl}/entity-edge/${params.uuid}`,
        json: true,
    });
}
//# sourceMappingURL=GenericFunctions.js.map