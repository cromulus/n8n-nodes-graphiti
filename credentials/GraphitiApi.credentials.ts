import {
    ICredentialTestRequest,
    ICredentialType,
    NodePropertyTypes,
} from 'n8n-workflow';

export class GraphitiApi implements ICredentialType {
    name = 'graphitiApi';
    displayName = 'Graphiti API';
    documentationUrl = 'https://your-fastapi-docs-url'; // Replace with your FastAPI docs URL if available
    properties: INodeProperties[] = [
        {
            displayName: 'API Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'http://localhost:8000',
            description: 'The base URL of the Graphiti FastAPI server',
            required: true,
        },
    ];

    test: ICredentialTestRequest = {
        request: {
            baseURL: '={{$credentials.baseUrl}}',
            url: '/episodes/', // Adjust if your API doesn't support GET
            method: 'GET',
        },
    };
}