import { ICredentialTestRequest, ICredentialType, NodePropertyTypes } from 'n8n-workflow';
export declare class GraphitiApi implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    properties: {
        displayName: string;
        name: string;
        type: NodePropertyTypes;
        default: string;
        description: string;
        required: boolean;
    }[];
    test: ICredentialTestRequest;
}
