import {
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
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
            description: 'The base URL of the Graphiti FastAPI server (e.g., http://localhost:8000 or http://graphiti.web.1:5000)',
            required: true,
            placeholder: 'http://localhost:8000',
        },
    ];

    test: ICredentialTestRequest = {
        request: {
            baseURL: '={{$credentials.baseUrl}}',
            url: '/healthcheck',
            method: 'GET',
        },
    };
}
