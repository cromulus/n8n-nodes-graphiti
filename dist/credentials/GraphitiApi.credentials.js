"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphitiApi = void 0;
class GraphitiApi {
    constructor() {
        this.name = 'graphitiApi';
        this.displayName = 'Graphiti API';
        this.documentationUrl = 'https://your-fastapi-docs-url';
        this.properties = [
            {
                displayName: 'API Base URL',
                name: 'baseUrl',
                type: 'string',
                default: 'http://localhost:8000',
                description: 'The base URL of the Graphiti FastAPI server',
                required: true,
            },
        ];
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl}}',
                url: '/episodes/',
                method: 'GET',
            },
        };
    }
}
exports.GraphitiApi = GraphitiApi;
//# sourceMappingURL=GraphitiApi.credentials.js.map